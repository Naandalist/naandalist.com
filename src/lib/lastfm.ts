/**
 * Last.fm recent track for the home presence card.
 * user.getrecenttracks often returns empty images for YouTube Music scrobbles
 * (no album in the scrobble). When that happens, track.getInfo fills album + art.
 */

export interface LastfmImage {
  '#text': string
  size: string
}

export interface LastfmTrack {
  name: string
  artist: { '#text': string; mbid?: string }
  album: { '#text': string; mbid?: string }
  image: LastfmImage[]
  url: string
  mbid?: string
  '@attr'?: { nowplaying: string }
  date?: { '#text': string; uts: string }
}

const LASTFM_API = 'https://ws.audioscrobbler.com/2.0/'

const hasCover = (images: LastfmImage[] | undefined): boolean =>
  Boolean(images?.some((img) => Boolean(img['#text'])))

async function lastfmGet(
  apiKey: string,
  params: Record<string, string>,
): Promise<unknown> {
  const url = new URL(LASTFM_API)
  url.searchParams.set('api_key', apiKey)
  url.searchParams.set('format', 'json')
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) {
    throw new Error(`Last.fm HTTP ${res.status}`)
  }
  return res.json()
}

/** Prefer the largest non-empty image URL from a Last.fm image array. */
export function pickCover(images: LastfmImage[] | undefined): string {
  if (!images?.length) return ''
  return [...images].reverse().find((img) => img['#text'])?.['#text'] ?? ''
}

/**
 * Loads the latest scrobble for `user`. When recenttracks has no cover,
 * enriches album and images from track.getInfo.
 */
export async function loadLatestTrack(options: {
  user: string
  apiKey: string
}): Promise<LastfmTrack | null> {
  const { user, apiKey } = options
  if (!apiKey) return null

  const recent = (await lastfmGet(apiKey, {
    method: 'user.getrecenttracks',
    user,
    limit: '1',
  })) as {
    recenttracks?: { track?: LastfmTrack | LastfmTrack[] }
    error?: number
    message?: string
  }

  if (recent.error || !recent.recenttracks?.track) {
    return null
  }

  const raw = recent.recenttracks.track
  const track = Array.isArray(raw) ? raw[0] : raw
  if (!track?.name) return null

  const artist =
    typeof track.artist === 'string'
      ? String(track.artist)
      : track.artist?.['#text'] ?? ''
  const albumText =
    typeof track.album === 'string'
      ? String(track.album)
      : track.album?.['#text'] ?? ''

  const normalized: LastfmTrack = {
    name: track.name,
    artist: { '#text': artist, mbid: track.artist?.mbid },
    album: { '#text': albumText, mbid: track.album?.mbid },
    image: track.image ?? [],
    url: track.url,
    mbid: track.mbid,
    '@attr': track['@attr'],
    date: track.date,
  }

  if (hasCover(normalized.image) || !artist || !normalized.name) {
    return normalized
  }

  try {
    const info = (await lastfmGet(apiKey, {
      method: 'track.getInfo',
      artist,
      track: normalized.name,
    })) as {
      track?: {
        url?: string
        album?: {
          title?: string
          mbid?: string
          image?: LastfmImage[]
        }
      }
      error?: number
    }

    const album = info.track?.album
    if (album && hasCover(album.image)) {
      normalized.image = album.image ?? []
      if (!normalized.album['#text'] && album.title) {
        normalized.album = { '#text': album.title, mbid: album.mbid }
      }
      if (!normalized.url && info.track?.url) {
        normalized.url = info.track.url
      }
    }
  } catch {
    // Keep the scrobble without cover; the UI shows the clef placeholder.
  }

  return normalized
}
