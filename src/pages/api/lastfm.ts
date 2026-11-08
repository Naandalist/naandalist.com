import type { APIRoute } from 'astro'
import { loadLatestTrack } from '@/lib/lastfm'

export const prerender = false

const USER = 'naandalist'

// Fresh enough for the 20s client poll; short CDN cache cuts Last.fm rate use.
export const GET: APIRoute = async () => {
  const apiKey =
    process.env.LASTFM_API_KEY || import.meta.env.LASTFM_API_KEY || ''

  if (!apiKey) {
    return Response.json(
      { track: null, error: 'LASTFM_API_KEY is not configured' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  try {
    const track = await loadLatestTrack({ user: USER, apiKey })
    return Response.json(
      { track },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=60',
        },
      },
    )
  } catch (error) {
    console.error('Last.fm fetch failed:', error)
    return Response.json(
      { track: null, error: 'Failed to reach Last.fm' },
      { status: 502, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}
