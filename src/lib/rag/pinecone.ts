import { Pinecone } from '@pinecone-database/pinecone'
import { getEmbedding, getEmbeddings } from './embedding'

export interface PineconeRecord {
  id: string
  values: number[]
  metadata: {
    text: string
    source: string
    chunkIndex: number
    [key: string]: any
  }
}

export interface SearchMatch {
  id: string
  score?: number
  text: string
  source: string
  chunkIndex: number
}

export interface RawKnowledgeChunk {
  id: string
  text: string
  source: string
  chunkIndex: number
}

function getPineconeClient(): Pinecone {
  const apiKey = process.env.PINECONE_API_KEY || import.meta.env.PINECONE_API_KEY
  if (!apiKey) {
    throw new Error('PINECONE_API_KEY is not configured in environment variables.')
  }
  return new Pinecone({ apiKey })
}

export function getIndexName(): string {
  return process.env.PINECONE_INDEX || import.meta.env.PINECONE_INDEX || 'personal-chatbot'
}

export function getNamespace(): string {
  return process.env.PINECONE_NAMESPACE || import.meta.env.PINECONE_NAMESPACE || 'naandalist-knowledge'
}

/**
 * Upsert knowledge chunks into Pinecone.
 * Automatically tries Integrated Inference (llama-text-embed-v2) first.
 * If the index is a custom vector index, falls back to manual embeddings.
 */
export async function upsertKnowledge(chunks: RawKnowledgeChunk[]): Promise<void> {
  const pc = getPineconeClient()
  const index = pc.index({ name: getIndexName(), namespace: getNamespace() })

  const BATCH_SIZE = 50

  // 1. Try Pinecone Integrated Inference (zero client embedding needed)
  try {
    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE).map((c) => ({
        id: c.id,
        text: c.text,
        source: c.source,
        chunkIndex: c.chunkIndex,
      }))
      await index.upsertRecords({ records: batch })
    }
    console.log(`[Pinecone] Successfully upserted ${chunks.length} records via Integrated Inference.`)
    return
  } catch (integratedErr) {
    console.warn('[Pinecone] Integrated inference upsert failed or not enabled. Falling back to vector upsert...', integratedErr)
  }

  // 2. Fallback: Manual vector embeddings (Gemini/OpenAI)
  const records: PineconeRecord[] = []
  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE)
    const texts = batch.map((c) => c.text)
    const embeddings = await getEmbeddings(texts)

    for (let j = 0; j < batch.length; j++) {
      records.push({
        id: batch[j].id,
        values: embeddings[j],
        metadata: {
          text: batch[j].text,
          source: batch[j].source,
          chunkIndex: batch[j].chunkIndex,
        },
      })
    }
  }

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE)
    await index.upsert({ records: batch })
  }
}

/**
 * Delete specific chunks from Pinecone by ID.
 */
export async function deleteKnowledgeChunks(ids: string[]): Promise<void> {
  if (!ids.length) return
  const pc = getPineconeClient()
  const index = pc.index({ name: getIndexName(), namespace: getNamespace() })
  await index.deleteMany({ ids })
}

/**
 * Delete chunks matching metadata filter (e.g. { source: { $eq: 'author-naandalist.md' } }).
 */
export async function deleteKnowledgeByFilter(filter: Record<string, any>): Promise<void> {
  const pc = getPineconeClient()
  const index = pc.index({ name: getIndexName(), namespace: getNamespace() })
  await index.deleteMany({ filter })
}

/**
 * Clear all chunks in the knowledge namespace.
 */
export async function clearKnowledgeNamespace(): Promise<void> {
  const pc = getPineconeClient()
  const index = pc.index({ name: getIndexName(), namespace: getNamespace() })
  await index.deleteAll()
}

/**
 * Query similar chunks from Pinecone.
 * Automatically tries Integrated Inference (llama-text-embed-v2) searchRecords first.
 * Falls back to manual query vector search if needed.
 */
export async function searchKnowledge(
  queryText: string,
  topK = 4
): Promise<SearchMatch[]> {
  const apiKey = process.env.PINECONE_API_KEY || import.meta.env.PINECONE_API_KEY
  if (!apiKey) {
    return []
  }

  const pc = getPineconeClient()
  const index = pc.index({ name: getIndexName(), namespace: getNamespace() })

  // 1. Try Integrated Inference search (llama-text-embed-v2)
  try {
    const response = await index.searchRecords({
      query: {
        topK,
        inputs: { text: queryText },
      },
      fields: ['text', 'source', 'chunkIndex'],
    })

    if (response?.result?.hits && response.result.hits.length > 0) {
      return response.result.hits.map((hit) => {
        const fields = (hit.fields || {}) as Record<string, any>
        return {
          id: hit._id,
          score: hit._score,
          text: (fields.text as string) || '',
          source: (fields.source as string) || '',
          chunkIndex: (fields.chunkIndex as number) || 0,
        }
      })
    }
  } catch (searchErr) {
    console.warn('[Pinecone] searchRecords failed or not integrated, falling back to vector query...', searchErr)
  }

  // 2. Fallback: Query by vector using Gemini or OpenAI embedding
  try {
    const queryVector = await getEmbedding(queryText)
    const response = await index.query({
      vector: queryVector,
      topK,
      includeMetadata: true,
    })

    if (!response.matches || response.matches.length === 0) {
      return []
    }

    return response.matches.map((m) => {
      const meta = (m.metadata || {}) as Record<string, any>
      return {
        id: m.id,
        score: m.score,
        text: (meta.text as string) || '',
        source: (meta.source as string) || '',
        chunkIndex: (meta.chunkIndex as number) || 0,
      }
    })
  } catch (vectorErr) {
    console.error('[Pinecone] Vector query failed:', vectorErr)
    return []
  }
}
