import type { APIRoute } from 'astro'
import { llmsTxt } from '@/lib/llms'
import { loadLlmsInput } from '@/lib/llms-source'

export const GET: APIRoute = async ({ site }) =>
  new Response(llmsTxt(await loadLlmsInput(site)), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
