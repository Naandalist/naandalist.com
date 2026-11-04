/**
 * RAG Document Chunking Strategy
 * 
 * Uses recursive hierarchical splitting tailored for structured Markdown/Text documents.
 * Priority order preserves heading context, section integrity, and paragraph boundaries.
 */

export interface ChunkOptions {
  chunkSize?: number
  chunkOverlap?: number
  delimiters?: string[]
}

export interface Chunk {
  id: string
  text: string
  source: string
  chunkIndex: number
  metadata?: Record<string, any>
}

const DEFAULT_DELIMITERS = [
  '\n# ',
  '\n## ',
  '\n### ',
  '\n#### ',
  '\n\n',
  '\n',
  '. ',
  '? ',
  '! ',
  '; ',
  ' ',
  '',
]

const DEFAULT_CHUNK_SIZE = 800
const DEFAULT_CHUNK_OVERLAP = 120

/**
 * Recursively splits text using hierarchical delimiters until each chunk is within chunkSize.
 */
function splitTextRecursively(
  text: string,
  delimiters: string[],
  chunkSize: number,
  chunkOverlap: number
): string[] {
  const finalChunks: string[] = []
  
  if (text.length <= chunkSize) {
    const trimmed = text.trim()
    return trimmed ? [trimmed] : []
  }

  // Find the highest priority delimiter present in text
  let chosenDelimiter = delimiters[delimiters.length - 1]
  let nextDelimiters: string[] = []

  for (let i = 0; i < delimiters.length; i++) {
    const delim = delimiters[i]
    if (delim === '' || text.includes(delim)) {
      chosenDelimiter = delim
      nextDelimiters = delimiters.slice(i + 1)
      break
    }
  }

  // Split text by chosen delimiter
  const parts = chosenDelimiter === '' ? Array.from(text) : text.split(chosenDelimiter)
  
  let currentAccumulator: string[] = []
  let currentLength = 0

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    const partWithDelim = i > 0 && chosenDelimiter !== '' ? chosenDelimiter + part : part
    const partLength = partWithDelim.length

    if (currentLength + partLength > chunkSize && currentAccumulator.length > 0) {
      const combined = currentAccumulator.join('').trim()
      if (combined.length > chunkSize && nextDelimiters.length > 0) {
        // Sub-split oversized segments
        finalChunks.push(...splitTextRecursively(combined, nextDelimiters, chunkSize, chunkOverlap))
      } else if (combined) {
        finalChunks.push(combined)
      }

      // Calculate overlap by taking recent tokens/parts
      currentAccumulator = []
      currentLength = 0
      
      let overlapCount = 0
      for (let j = finalChunks.length - 1; j >= 0; j--) {
        const prev = finalChunks[j]
        if (overlapCount + prev.length <= chunkOverlap) {
          overlapCount += prev.length
        } else {
          break
        }
      }
    }

    currentAccumulator.push(partWithDelim)
    currentLength += partLength
  }

  if (currentAccumulator.length > 0) {
    const remaining = currentAccumulator.join('').trim()
    if (remaining.length > chunkSize && nextDelimiters.length > 0) {
      finalChunks.push(...splitTextRecursively(remaining, nextDelimiters, chunkSize, chunkOverlap))
    } else if (remaining) {
      finalChunks.push(remaining)
    }
  }

  return finalChunks
}

/**
 * Splits a document into chunks with source metadata and index.
 */
export function chunkDocument(
  text: string,
  source: string,
  options: ChunkOptions = {}
): Chunk[] {
  const chunkSize = options.chunkSize ?? DEFAULT_CHUNK_SIZE
  const chunkOverlap = options.chunkOverlap ?? DEFAULT_CHUNK_OVERLAP
  const delimiters = options.delimiters ?? DEFAULT_DELIMITERS

  const rawChunks = splitTextRecursively(text, delimiters, chunkSize, chunkOverlap)

  return rawChunks.map((chunkText, index) => ({
    id: `${source}-chunk-${index}`,
    text: chunkText,
    source,
    chunkIndex: index,
    metadata: {
      source,
      chunkIndex: index,
      charCount: chunkText.length,
    },
  }))
}
