import type { APIRoute } from 'astro'
import { loadContributions } from '@/lib/github'

export const prerender = false

// Runs on each request so the home graph is not frozen at the last build. Vercel caches the response for an hour.
export const GET: APIRoute = async () => {
  const data = await loadContributions({ user: 'naandalist', token: import.meta.env.GITHUB_TOKEN })
  return Response.json(data, { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } })
}
