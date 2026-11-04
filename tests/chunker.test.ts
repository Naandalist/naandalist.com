import { describe, it, expect } from 'bun:test'
import { chunkDocument } from '../src/lib/rag/chunker'

describe('RAG Chunker', () => {
  it('should split document into chunks respecting headings and paragraphs', () => {
    const markdown = `
# Listiananda Apriliawan
Software Engineer and Full-stack Developer based in Indonesia.

## Experience
Senior Full-stack Engineer working on modern web applications, distributed systems, and AI agent integration.

## Projects
- IPB Bike Center: Smart bike sharing management.
- Kalanusa: Cultural preservation platform.
- SATRIA: Credit risk analysis platform with machine learning.

## Skills & Stack
TypeScript, React, Astro, Next.js, Node.js, Python, PostgreSQL, Vector Databases.
`
    const chunks = chunkDocument(markdown, 'profile.md', { chunkSize: 150, chunkOverlap: 20 })
    
    expect(chunks.length).toBeGreaterThan(1)
    for (const chunk of chunks) {
      expect(chunk.source).toBe('profile.md')
      expect(chunk.text.length).toBeGreaterThan(0)
      expect(chunk.id).toContain('profile.md-chunk-')
    }
  })

  it('should return a single chunk for short text', () => {
    const text = 'Short bio about Naandalist.'
    const chunks = chunkDocument(text, 'bio.md', { chunkSize: 500 })
    expect(chunks.length).toBe(1)
    expect(chunks[0].text).toBe(text)
  })
})
