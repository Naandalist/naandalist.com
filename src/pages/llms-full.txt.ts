import type { APIRoute } from 'astro'
import { llmsFullTxt } from '@/lib/llms'
import { loadLlmsInput } from '@/lib/llms-source'

export const GET: APIRoute = async ({ site }) =>
  new Response(llmsFullTxt(await loadLlmsInput(site)), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
