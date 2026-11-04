/**
 * Small in-process cache for slow network calls made while rendering a page. In dev the page is
 * rendered again on every navigation, so without this each visit to Home waits on GitHub and
 * Gravatar again. Concurrent callers share one call, and failures are never cached.
 */

const store = new Map<string, { at: number; value: Promise<unknown> }>()

export function memo<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const hit = store.get(key)
  if (hit && Date.now() - hit.at < ttlMs) return hit.value as Promise<T>
  const value = load()
  store.set(key, { at: Date.now(), value })
  value.catch(() => store.delete(key))
  return value
}

/** Resolve with the fallback if the work takes longer than ms. */
export function withTimeout<T, F>(work: Promise<T>, ms: number, fallback: F): Promise<T | F> {
  return Promise.race([work, new Promise<F>((resolve) => setTimeout(() => resolve(fallback), ms))])
}
