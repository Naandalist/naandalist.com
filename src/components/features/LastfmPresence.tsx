import { MoveUpRight } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'
import { FaHeadphonesAlt, FaLastfm, FaSpotify } from 'react-icons/fa'
import { CACHE_KEYS, CACHE_TTL, getStaleWhileRevalidate, setCachedData } from '@/lib/cache'

interface Track {
  name: string
  artist: { '#text': string }
  album: { '#text': string }
  image: { '#text': string }[]
  url: string
  '@attr'?: { nowplaying: string }
}

const fallbackTrack = (
  name: string,
  artist: string,
  album: string,
  cover: string,
  id: string,
): Track => ({
  name,
  artist: { '#text': artist },
  album: { '#text': album },
  image: [{ '#text': '' }, { '#text': '' }, { '#text': '' }, { '#text': cover }],
  url: `https://open.spotify.com/track/${id}`,
})

// Tracks shown while the Last.fm feed has no scrobbles yet. One is picked at
// random on each load. Remove once scrobbling from YouTube Music is live.
const FALLBACK_TRACKS: Track[] = [
  fallbackTrack(
    'Elegi',
    'Figura Renata',
    'Figura Renata',
    'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e0219b19b9a8b85d557ed0a1085',
    '3pZK71INUBAuIltdTMe7mz',
  ),
  fallbackTrack(
    'Rasa & Karsa',
    'Figura Renata',
    'Figura Renata',
    'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e0219b19b9a8b85d557ed0a1085',
    '5k8QGcDjSx8Bv6P25H6NFU',
  ),
  fallbackTrack(
    'Hujan Di Mimpi',
    'Banda Neira',
    'Berjalan Lebih Jauh',
    'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e029029c55d57c2e8ff546685d7',
    '4Sl7Eb1XVBVLgCD7kaXPBA',
  ),
]

// How often to refresh the track while the tab is open
const POLL_INTERVAL = 20 * 1000

const pickFallback = (): Track =>
  FALLBACK_TRACKS[Math.floor(Math.random() * FALLBACK_TRACKS.length)]

const LastfmPresence = () => {
  // Start empty on both server and client, then read the cache after mount.
  // Reading localStorage in the initializer makes the first client render differ from SSR.
  const [displayData, setDisplayData] = useState<Track | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    // Stale-While-Revalidate: show cached data instantly, refresh in background
    const { data: cached, isStale } = getStaleWhileRevalidate<Track>(CACHE_KEYS.LASTFM)
    if (cached) {
      setDisplayData(cached)
      setIsLoading(false)
    }

    let disposed = false
    let hasRealTrack = Boolean(cached)

    const load = () => {
      fetch('/api/lastfm')
        .then((response) => response.json())
        .then((data) => {
          if (disposed) return
          if (data.track) {
            hasRealTrack = true
            setCachedData(CACHE_KEYS.LASTFM, data.track, CACHE_TTL.LASTFM)
            setDisplayData(data.track)
          } else if (!hasRealTrack) {
            // No scrobbles yet: show a random fallback track instead.
            setDisplayData((prev) => prev ?? pickFallback())
          }
          setIsLoading(false)
        })
        .catch((error) => {
          console.error('Error fetching latest song:', error)
          if (disposed) return
          // Keep whatever is on screen; only fall back when there is nothing yet.
          if (!hasRealTrack) setDisplayData((prev) => prev ?? pickFallback())
          setIsLoading(false)
        })
    }

    if (isStale) load()

    // Poll while the tab is visible; refresh right away when it comes back.
    let timer = 0
    const startPolling = () => {
      window.clearInterval(timer)
      timer = window.setInterval(load, POLL_INTERVAL)
    }
    const onVisibility = () => {
      if (document.hidden) {
        window.clearInterval(timer)
      } else {
        load()
        startPolling()
      }
    }
    if (!document.hidden) startPolling()
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      disposed = true
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  const wrap = 'relative flex h-full w-full flex-col gap-4'
  const coverBox = 'aspect-square size-28 shrink-0 rounded-lg sm:size-36'

  if (isLoading) {
    return (
      <div className={wrap}>
        <div className="flex flex-col gap-1">
          <div className="flex h-5 items-center gap-2">
            <div className="size-3.5 shrink-0 animate-pulse rounded-full bg-foreground/10" />
            <div className="h-3.5 w-24 animate-pulse rounded-sm bg-foreground/10" />
          </div>
          <div className="flex h-7 items-center">
            <div className="h-5 w-48 animate-pulse rounded-sm bg-foreground/10" />
          </div>
          <div className="flex h-5 items-center">
            <div className="h-3.5 w-3/5 animate-pulse rounded-sm bg-foreground/10" />
          </div>
        </div>
        <div className={`${coverBox} animate-pulse border-1 glass-card`} />
        <div className="absolute bottom-0 right-0 size-11 animate-pulse rounded-full bg-foreground/10" />
      </div>
    )
  }

  if (!displayData)
    return (
      <motion.div
        className={wrap}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-2 text-sm text-foreground">
            <FaLastfm size={14} className="shrink-0" />
            Last.fm
          </span>
          <p className="text-lg font-bold leading-tight text-foreground">Signal lost...</p>
          <p className="text-sm text-muted-foreground">
            Couldn't reach Last.fm. The API dropped the mic, check back later.
          </p>
        </div>
        <div className={`${coverBox} flex items-center justify-center border-1 glass-card text-foreground`}>
          <FaHeadphonesAlt size={36} />
        </div>
      </motion.div>
    )

  const isPinned = FALLBACK_TRACKS.includes(displayData)
  const isPlaying = displayData['@attr']?.nowplaying === 'true'
  const { name: song, artist, album, image, url } = displayData
  // Last.fm returns empty strings when it has no cover (e.g. scrobbles without album metadata).
  const cover =
    image
      .map((i) => i['#text'])
      .reverse()
      .find(Boolean) ?? ''
  const status = isPinned ? 'On repeat' : isPlaying ? 'Listening now' : 'Last played'

  return (
    <motion.div
      className={wrap}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="flex min-w-0 flex-col gap-1">
        <span className="flex items-center gap-2 text-sm text-foreground">
          {isPinned ? <FaSpotify size={14} className="shrink-0" /> : <FaLastfm size={14} className="shrink-0" />}
          {isPinned ? 'Spotify' : 'Last.fm'}
          <span className="text-muted-foreground">· {status}</span>
          {isPlaying && (
            <span className="flex h-3 items-end gap-0.5" aria-hidden="true">
              {[0, 150, 300].map((delay) => (
                <span
                  key={delay}
                  className="h-full w-0.5 animate-pulse rounded-full bg-foreground"
                  style={{ animationDelay: `${delay}ms`, animationDuration: '1.2s' }}
                />
              ))}
            </span>
          )}
        </span>
        <p className="truncate text-lg font-bold leading-tight text-foreground">{song}</p>
        <p className="truncate text-sm text-muted-foreground">
          {artist['#text']}
          {album['#text'] ? ` · ${album['#text']}` : ''}
        </p>
      </div>

      {cover ? (
        <motion.img
          src={cover}
          alt="Album art"
          width={160}
          height={160}
          loading="eager"
          decoding="async"
          className={`${coverBox} border-1 glass-card object-cover grayscale transition-[filter] duration-200 hover:grayscale-0`}
          whileHover={{ scale: 1.05, rotate: 1.5 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        />
      ) : (
        <div
          aria-hidden="true"
          className={`${coverBox} flex items-center justify-center border-1 glass-card text-foreground`}
        >
          <motion.div
            className="flex size-3/5 items-center justify-center"
            animate={reduceMotion ? undefined : { y: [0, -4, 0, 4, 0], rotate: [-4, 4, -4] }}
            transition={{
              y: { duration: 5, ease: 'easeInOut', repeat: Infinity },
              rotate: { duration: 4, ease: 'easeInOut', repeat: Infinity },
            }}
          >
            <FaHeadphonesAlt className="size-full" />
          </motion.div>
        </div>
      )}

      <a
        href={url}
        aria-label={isPinned ? 'Listen on Spotify' : 'View on last.fm'}
        title={isPinned ? 'Listen on Spotify' : 'View on last.fm'}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-0 right-0 flex size-11 items-center justify-center rounded-full border-1 border-foreground/30 bg-foreground/10 text-foreground transition-all duration-150 hover:rotate-12 hover:border-foreground/60 hover:bg-foreground/20"
      >
        <MoveUpRight size={16} />
      </a>
    </motion.div>
  )
}

export default LastfmPresence
