import fs from 'node:fs'
import path from 'node:path'
import { generateText } from 'ai'
import { google } from '@ai-sdk/google'
import { chunkDocument, type Chunk } from '../src/lib/rag/chunker'
import { upsertKnowledge, getIndexName, getNamespace } from '../src/lib/rag/pinecone'

const KNOWLEDGE_DIR = path.resolve(process.cwd(), 'knowledge')

/**
 * Parse a PDF or DOCX file using LlamaParse REST API v2.
 */
async function parseWithLlamaParse(filePath: string, apiKey: string): Promise<string> {
  const fileName = path.basename(filePath)
  console.log(`[LlamaParse v2] Uploading ${fileName}...`)

  const fileBuffer = fs.readFileSync(filePath)
  const blob = new Blob([fileBuffer])

  // 1. Upload file
  const formData = new FormData()
  formData.append('file', blob, fileName)
  formData.append('purpose', 'parse')

  const uploadRes = await fetch('https://api.cloud.llamaindex.ai/api/v1/beta/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  })

  if (!uploadRes.ok) {
    const errText = await uploadRes.text()
    throw new Error(`LlamaParse file upload failed (${uploadRes.status}): ${errText}`)
  }

  const uploadData = await uploadRes.json()
  const fileId = uploadData.id
  console.log(`[LlamaParse v2] File uploaded with ID: ${fileId}. Starting parse job...`)

  // 2. Trigger parse job (API v2)
  const parseRes = await fetch('https://api.cloud.llamaindex.ai/api/v2/parse', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      file_id: fileId,
      tier: 'agentic',
      version: 'latest',
      agentic_options: {
        custom_prompt:
          'Extract all document sections verbatim into clean, well-formatted Markdown with consistent heading hierarchy (# for document title, ## for major sections like Experience, Projects, Skills, Education, ### for individual roles or projects). Preserve all inline formatting such as bold (**text**) and italics (*text*), metrics, dates, bullet points, and technical keywords exactly as written. Do not summarize or omit any details.',
      },
    }),
  })

  if (!parseRes.ok) {
    const errText = await parseRes.text()
    throw new Error(`LlamaParse job creation failed (${parseRes.status}): ${errText}`)
  }

  const parseData = await parseRes.json()
  const jobId = parseData.id

  // 3. Poll for completion
  console.log(`[LlamaParse v2] Waiting for parsing job ${jobId} to finish...`)
  let attempts = 0
  const maxAttempts = 60

  while (attempts < maxAttempts) {
    await new Promise((r) => setTimeout(r, 2000))
    attempts++

    const statusRes = await fetch(`https://api.cloud.llamaindex.ai/api/v2/parse/${jobId}?expand=markdown`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })

    if (!statusRes.ok) {
      continue
    }

    const jobStatus = await statusRes.json()
    const status = jobStatus.job?.status || jobStatus.status

    if (status === 'COMPLETED' || status === 'SUCCESS') {
      console.log(`[LlamaParse v2] Successfully parsed ${fileName}!`)
      if (jobStatus.markdown?.pages && Array.isArray(jobStatus.markdown.pages)) {
        return jobStatus.markdown.pages.map((p: any) => p.markdown || '').join('\n\n')
      }
      return typeof jobStatus.markdown === 'string' ? jobStatus.markdown : (jobStatus.text || '')
    }

    if (status === 'ERROR' || status === 'FAILED') {
      throw new Error(`LlamaParse job failed: ${JSON.stringify(jobStatus.job?.error_message || jobStatus.error)}`)
    }
  }

  throw new Error(`LlamaParse job timed out for ${fileName}`)
}

/**
 * Fallback: Parse a PDF using Google Gemini Multimodal Vision if LlamaParse is unavailable.
 */
async function parsePdfWithGemini(filePath: string): Promise<string> {
  const fileName = path.basename(filePath)
  console.log(`[Gemini Vision Fallback] Parsing ${fileName}...`)
  const fileData = fs.readFileSync(filePath)
  
  const res = await generateText({
    model: google('gemini-3.5-flash-lite'),
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Extract all content from this document and convert it into clean, well-structured Markdown, preserving all headings, dates, jobs, technical skills, projects, and bullet points verbatim. Do not summarize.',
          },
          {
            type: 'file',
            data: fileData,
            mediaType: 'application/pdf',
          },
        ],
      },
    ],
  })

  return res.text
}

/**
 * Main indexing function.
 */
async function main() {
  console.log('--- RAG Knowledge Base Ingestion ---')
  console.log(`Target Pinecone Index: ${getIndexName()} | Namespace: ${getNamespace()}`)

  const llamaKey = process.env.LLAMA_CLOUD_API_KEY
  const googleKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY

  if (!fs.existsSync(KNOWLEDGE_DIR)) {
    fs.mkdirSync(KNOWLEDGE_DIR, { recursive: true })
  }

  const files = fs.readdirSync(KNOWLEDGE_DIR).filter((f) => {
    return !f.startsWith('.') && f !== 'README.md'
  })

  const documents: Array<{ name: string; content: string }> = []

  // Ingest from knowledge directory
  for (const file of files) {
    const filePath = path.join(KNOWLEDGE_DIR, file)
    const ext = path.extname(file).toLowerCase()

    if (ext === '.md' || ext === '.txt') {
      console.log(`Reading text document: ${file}`)
      const content = fs.readFileSync(filePath, 'utf-8')
      documents.push({ name: file, content })
    } else if (ext === '.pdf' || ext === '.docx') {
      let parsed = false

      // 1. Primary: Use LlamaParse REST API v2
      if (llamaKey) {
        try {
          const content = await parseWithLlamaParse(filePath, llamaKey)
          console.log(`[LlamaParse v2] Successfully extracted ${file} (${content.length} chars)`)
          documents.push({ name: file, content })
          parsed = true
        } catch (llamaErr) {
          console.warn(`[LlamaParse v2] Error on ${file}, trying Gemini fallback:`, llamaErr)
        }
      }

      // 2. Fallback: Gemini Vision (if LlamaParse fails or key is not provided)
      if (!parsed && ext === '.pdf' && googleKey) {
        try {
          const content = await parsePdfWithGemini(filePath)
          console.log(`[Gemini Vision Fallback] Successfully extracted ${file} (${content.length} chars)`)
          documents.push({ name: file, content })
          parsed = true
        } catch (geminiErr) {
          console.error(`[Gemini Vision Fallback] Failed for ${file}:`, geminiErr)
        }
      }

      if (!parsed) {
        console.warn(`[Warning] Could not parse ${file}. Ensure LLAMA_CLOUD_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY is valid.`)
      }
    }
  }

  if (documents.length === 0) {
    console.log('No documents found to index. Place .md, .txt, or .pdf files in the knowledge/ folder.')
    return
  }

  console.log(`\nFound ${documents.length} document(s). Chunking...`)

  const allChunks: Chunk[] = []
  for (const doc of documents) {
    const chunks = chunkDocument(doc.content, doc.name, {
      chunkSize: 800,
      chunkOverlap: 120,
    })
    console.log(` - ${doc.name}: generated ${chunks.length} chunks`)
    allChunks.push(...chunks)
  }

  console.log(`\nTotal chunks across all documents: ${allChunks.length}`)
  console.log('Upserting chunks to Pinecone (chatbot-website)...')
  await upsertKnowledge(allChunks)

  console.log('\nIngestion completed successfully!')
}

main().catch((err) => {
  console.error('Ingestion failed with error:', err)
  process.exit(1)
})
