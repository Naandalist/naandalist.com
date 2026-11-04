import type { APIRoute } from 'astro'
import { robotsTxt } from '@/lib/robots'

export const GET: APIRoute = ({ site }) =>
  new Response(robotsTxt({ sitemapUrl: new URL('sitemap-index.xml', site).href, llmsUrl: new URL('llms.txt', site).href }), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
