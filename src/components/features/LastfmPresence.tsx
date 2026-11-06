import { MoveUpRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { FaHeadphonesAlt, FaLastfm, FaSpotify } from 'react-icons/fa'
import { motion } from 'motion/react'
import {
  getStaleWhileRevalidate,
  setCachedData,
  CACHE_TTL,
  CACHE_KEYS,
} from '@/lib/cache'

interface Track {
  name: string
  artist: { '#text': string }
  album: { '#text': string }
  image: { '#text': string }[]
  url: string
  '@attr'?: { nowplaying: string }
}

const fallbackTrack = (name: string, artist: string, album: string, cover: string, id: string): Track => ({
  name,
  artist: { '#text': artist },
  album: { '#text': album },
  image: [{ '#text': '' }, { '#text': '' }, { '#text': '' }, { '#text': cover }],
  url: `https://open.spotify.com/track/${id}`,
})

// Tracks shown while the Last.fm feed has no scrobbles yet. One is picked at
// random on each load. Remove once scrobbling from YouTube Music is live.
const FALLBACK_TRACKS: Track[] = [
  fallbackTrack('Elegi', 'Figura Renata', 'Figura Renata', 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e0219b19b9a8b85d557ed0a1085', '3pZK71INUBAuIltdTMe7mz'),
  fallbackTrack('Rasa & Karsa', 'Figura Renata', 'Figura Renata', 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e0219b19b9a8b85d557ed0a1085', '5k8QGcDjSx8Bv6P25H6NFU'),
  fallbackTrack('Hujan Di Mimpi', 'Banda Neira', 'Berjalan Lebih Jauh', 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e029029c55d57c2e8ff546685d7', '4Sl7Eb1XVBVLgCD7kaXPBA'),
]

// How often to refresh the track while the tab is open
const POLL_INTERVAL = 20 * 1000

const pickFallback = (): Track => FALLBACK_TRACKS[Math.floor(Math.random() * FALLBACK_TRACKS.length)]

const LastfmPresence = () => {
  // Start empty on both server and client, then read the cache after mount.
  // Reading localStorage in the initializer makes the first client render differ from SSR.
  const [displayData, setDisplayData] = useState<Track | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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
      fetch('https://lastfm-last-played.biancarosa.com.br/naandalist/latest-song')
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

  if (isLoading) {
    return (
      <div className="relative flex h-full w-full flex-col items-start justify-between gap-4 p-2 md:flex-row md:items-center">
        <div className="relative flex h-full w-full flex-row items-start justify-between gap-4">
          {/* Album art skeleton, same box as the real image */}
          <div className="mb-2 aspect-square w-28 max-w-[160px] animate-pulse rounded-lg border border-border bg-primary/10 md:w-full" />
          <div className="flex min-w-0 flex-1 flex-col justify-end overflow-hidden">
            <div className="flex flex-col">
              {/* Icon row: same height as the real icon and label, with the Last.fm logo slot on md */}
              <span className="mt-1 mb-1 flex h-[22px] w-full items-center gap-2 sm:h-6">
                <div className="size-[22px] shrink-0 animate-pulse rounded-full bg-primary/10" />
                <div className="h-4 w-28 animate-pulse rounded-sm bg-primary/10" />
                <div className="ml-auto hidden size-[22px] shrink-0 animate-pulse rounded-full bg-primary/10 md:block" />
              </span>
              <div className="flex flex-col">
                {/* Song title: line box of text-base sm:text-xl leading-snug */}
                <div className="flex h-[22px] items-center sm:h-[27.5px]">
                  <div className="h-4 w-48 animate-pulse rounded-sm bg-primary/10 sm:h-5" />
                </div>
                {/* Artist and album: line box of text-sm sm:text-base */}
                <div className="flex h-5 items-center sm:h-6">
                  <div className="h-3.5 w-[60%] animate-pulse rounded-sm bg-primary/10" />
                </div>
                <div className="flex h-5 items-center sm:h-6">
                  <div className="h-3.5 w-[50%] animate-pulse rounded-sm bg-primary/10" />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Link button skeleton, same 44px circle as the real button */}
        <div className="absolute bottom-0 right-0 m-3 size-11 animate-pulse rounded-full bg-primary/10" />
      </div>
    )
  }

  if (!displayData)
    return (
      <motion.div
        className="relative flex h-full w-full flex-row items-start justify-between gap-4 p-2"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        {/* Album art placeholder */}
        <div className="mb-2 flex w-28 max-w-[160px] shrink-0 items-center justify-center rounded-lg border border-border bg-secondary/40 aspect-square">
          <motion.div
            className="hidden md:block"
            animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
            transition={{ duration: 1.6, ease: 'easeInOut', delay: 0.3 }}
          >
            <FaLastfm size={36} className="text-muted-foreground/50" />
          </motion.div>
        </div>

        {/* Text area */}
        <div className="flex min-w-0 flex-1 flex-col justify-end overflow-hidden">
          <div className="flex flex-col gap-1.5">
            <span className="flex w-full items-center gap-2 text-sm text-muted-foreground">
              <FaHeadphonesAlt size={14} className="shrink-0" />
              Signal lost...
              <FaLastfm size={24} className="ml-auto hidden shrink-0 text-muted-foreground/40 md:block" />
            </span>
            <span className="truncate text-lg font-bold leading-tight text-primary/80">
              Couldn't reach Last.fm API
            </span>
            <span className="text-sm text-muted-foreground leading-snug">
              The API dropped the mic. Check back later.
            </span>
          </div>
        </div>

      </motion.div>
    )

  const isPinned = FALLBACK_TRACKS.includes(displayData)
  const { name: song, artist, album, image, url } = displayData

  return (
    <motion.div
      className="relative flex h-full w-full flex-col items-start justify-between gap-4 p-2 md:flex-row md:items-center"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="relative flex h-full w-full flex-row items-start justify-between gap-4">
        <motion.img
          src={image[3]['#text']}
          alt="Album art"
          width={160}
          height={160}
          loading="eager"
          decoding="async"
          className="mb-2 aspect-square w-28 max-w-[160px] rounded-lg border border-border object-cover grayscale transition-[filter] duration-200 hover:grayscale-0 md:w-full"
          whileHover={{ scale: 1.05, rotate: 1.5 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        />
        <div className="flex min-w-0 flex-1 flex-col justify-end overflow-hidden">
          <div className="flex flex-col">
            <span className="mt-1 mb-1 flex w-full items-center gap-2 text-primary sm:mb-1">
              {displayData['@attr']?.nowplaying === 'true' ? (
                <div className="flex items-end space-x-1 h-5 pb-0.5">
                  <div
                    className="w-1 h-3 bg-primary/90 rounded-full animate-pulse"
                    style={{ animationDelay: '0ms', animationDuration: '1.5s' }}
                  />
                  <div
                    className="w-1 h-4 bg-primary/70 rounded-full animate-pulse"
                    style={{
                      animationDelay: '150ms',
                      animationDuration: '1.2s',
                    }}
                  />
                  <div
                    className="w-1 h-5 bg-primary/60 rounded-full animate-pulse"
                    style={{
                      animationDelay: '300ms',
                      animationDuration: '1.5s',
                    }}
                  />
                  <div
                    className="w-1 h-3.5 bg-primary/90 rounded-full animate-pulse"
                    style={{
                      animationDelay: '450ms',
                      animationDuration: '1.2s',
                    }}
                  />
                </div>
              ) : (
                <FaHeadphonesAlt size={22} className="shrink-0" />
              )}
              <span className="text-sm sm:text-base font-medium text-primary">
                {isPinned
                  ? 'On repeat...'
                  : displayData['@attr']?.nowplaying === 'true'
                    ? 'Listening to...'
                    : 'Last played...'}
              </span>
              {isPinned ? (
                <FaSpotify size={22} className="ml-auto hidden shrink-0 md:block" />
              ) : (
                <FaLastfm size={22} className="ml-auto hidden shrink-0 md:block" />
              )}
            </span>
            <div className="flex flex-col">
              <span className="truncate text-base sm:text-xl font-bold leading-snug text-primary">
                {song}
              </span>
              <span className="w-[85%] truncate text-sm sm:text-base text-muted-foreground">
                <span className="font-semibold text-secondary-foreground">
                  by
                </span>{' '}
                {artist['#text']}
              </span>
              <span className="w-[85%] truncate text-sm sm:text-base text-muted-foreground">
                <span className="font-semibold text-secondary-foreground">
                  on
                </span>{' '}
                {album['#text']}
              </span>
            </div>
          </div>
        </div>
      </div>
      <a
        href={url}
        aria-label={isPinned ? 'Listen on Spotify' : 'View on last.fm'}
        title={isPinned ? 'Listen on Spotify' : 'View on last.fm'}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-0 right-0 m-3 flex w-fit items-end rounded-full border bg-secondary/50 p-3 text-primary transition-all duration-150 hover:rotate-12 hover:ring-1 hover:ring-primary"
      >
        <MoveUpRight size={16} />
      </a>
    </motion.div>
  )
}

export default LastfmPresence
