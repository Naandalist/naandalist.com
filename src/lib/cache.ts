/**
 * LocalStorage caching utility with TTL (Time-To-Live)
 * Used for caching API responses to reduce load times on repeat visits
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

const CACHE_PREFIX = 'naandalist_cache_'

/**
 * Get cached data from localStorage
 * Returns null if cache is expired or doesn't exist
 */
export function getCachedData<T>(key: string): T | null {
  if (typeof window === 'undefined') return null

  try {
    const cached = localStorage.getItem(CACHE_PREFIX + key)
    if (!cached) return null

    const entry: CacheEntry<T> = JSON.parse(cached)
    const now = Date.now()

    // Check if expired
    if (now - entry.timestamp > entry.ttl) {
      localStorage.removeItem(CACHE_PREFIX + key)
      return null
    }

    return entry.data
  } catch {
    return null
  }
}

/**
 * Get cached data even if stale (for SWR pattern)
 * Returns { data, isStale } - data even if expired, isStale indicates if refresh needed
 */
export function getStaleWhileRevalidate<T>(key: string): { data: T | null; isStale: boolean } {
  if (typeof window === 'undefined') return { data: null, isStale: true }

  try {
    const cached = localStorage.getItem(CACHE_PREFIX + key)
    if (!cached) return { data: null, isStale: true }

    const entry: CacheEntry<T> = JSON.parse(cached)
    const now = Date.now()
    const isStale = now - entry.timestamp > entry.ttl

    // Return data even if stale, let caller decide to revalidate
    return { data: entry.data, isStale }
  } catch {
    return { data: null, isStale: true }
  }
}

/**
 * Set data in localStorage cache with TTL
 */
export function setCachedData<T>(key: string, data: T, ttlMs: number): void {
  if (typeof window === 'undefined') return

  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    }
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry))
  } catch {
    // Storage full or unavailable
  }
}

/**
 * Clear specific cache entry
 */
export function clearCache(key: string): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(CACHE_PREFIX + key)
}

/**
 * Clear all app cache entries
 */
export function clearAllCache(): void {
  if (typeof window === 'undefined') return

  const keysToRemove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith(CACHE_PREFIX)) {
      keysToRemove.push(key)
    }
  }
  for (const key of keysToRemove) {
    localStorage.removeItem(key)
  }
}

/**
 * Cache TTL constants (in milliseconds)
 */
export const CACHE_TTL = {
  WAKATIME: 5 * 60 * 1000, // stats don't change frequently
  LASTFM: 2 * 60 * 1000, // music changes more often
  VIEW_COUNT: 30 * 1000, // for potential view count caching
}

/**
 * Cache keys
 */
export const CACHE_KEYS = {
  // v2: last 7 days as { totalSeconds, languages }. The old key held an array for the chart.
  WAKATIME: 'wakatime_stats_v2',
  LASTFM: 'lastfm_track',
}
