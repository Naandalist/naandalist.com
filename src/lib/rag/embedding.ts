import { embed, embedMany } from 'ai'
import { google } from '@ai-sdk/google'
import { openai } from '@ai-sdk/openai'

/**
 * Standard embedding dimension used across both Gemini and OpenAI fallback.
 * Pinecone index must be created with dimension 768 (metric: cosine).
 */
export const EMBEDDING_DIMENSION = 768

/**
 * Generates an embedding vector for a single string.
 * Primary: Google Gemini text-embedding-004 (768 dimensions).
 * Fallback: OpenAI text-embedding-3-small with dimensions set to 768.
 */
export async function getEmbedding(text: string): Promise<number[]> {
  const googleApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || import.meta.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY
  const openaiApiKey = process.env.OPENAI_API_KEY || import.meta.env.OPENAI_API_KEY

  if (googleApiKey) {
    try {
      const { embedding } = await embed({
        model: google.embedding('text-embedding-004'),
        value: text,
      })
      return embedding
    } catch (err) {
      console.warn('Google embedding failed, attempting OpenAI fallback...', err)
    }
  }

  if (openaiApiKey) {
    const { embedding } = await embed({
      model: openai.embedding('text-embedding-3-small'),
      value: text,
      providerOptions: {
        openai: {
          dimensions: EMBEDDING_DIMENSION,
        },
      },
    })
    return embedding
  }

  throw new Error('No embedding API key found (neither GOOGLE_GENERATIVE_AI_API_KEY nor OPENAI_API_KEY).')
}

/**
 * Generates embedding vectors for an array of strings in batch.
 * Primary: Google Gemini text-embedding-004.
 * Fallback: OpenAI text-embedding-3-small.
 */
export async function getEmbeddings(texts: string[]): Promise<number[][]> {
  const googleApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || import.meta.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY
  const openaiApiKey = process.env.OPENAI_API_KEY || import.meta.env.OPENAI_API_KEY

  if (googleApiKey) {
    try {
      const { embeddings } = await embedMany({
        model: google.embedding('text-embedding-004'),
        values: texts,
      })
      return embeddings
    } catch (err) {
      console.warn('Google batch embedding failed, attempting OpenAI fallback...', err)
    }
  }

  if (openaiApiKey) {
    const { embeddings } = await embedMany({
      model: openai.embedding('text-embedding-3-small'),
      values: texts,
      providerOptions: {
        openai: {
          dimensions: EMBEDDING_DIMENSION,
        },
      },
    })
    return embeddings
  }

  throw new Error('No embedding API key found (neither GOOGLE_GENERATIVE_AI_API_KEY nor OPENAI_API_KEY).')
}
