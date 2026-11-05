/**
 * Timing for the page-change loader. It appears only if a navigation takes longer than `delay`, so
 * fast page changes never flash it, and once shown it stays for at least `minVisible` so it does not blink.
 * While visible, a fake percentage eases toward `progressCap` (real load progress isn't observable) and
 * snaps to 100 once the navigation actually finishes. The DOM work is passed in as show, hide, and
 * onProgress, which keeps this logic testable.
 */

interface Options {
  show: () => void
  hide: () => void
  /** Called with the fake progress percentage (0-100) while visible. */
  onProgress?: (pct: number) => void
  /** Wait before showing, in ms. */
  delay?: number
  /** Shortest time to stay visible once shown, in ms. */
  minVisible?: number
  /** Ceiling the fake progress eases toward while the navigation is still in flight. */
  progressCap?: number
  /** How often the fake progress advances, in ms. */
  progressInterval?: number
  now?: () => number
  setTimer?: (fn: () => void, ms: number) => number
  clearTimer?: (id: number) => void
  setInterval?: (fn: () => void, ms: number) => number
  clearInterval?: (id: number) => void
}

export function createNavLoader({
  show,
  hide,
  onProgress,
  delay = 150,
  minVisible = 400,
  progressCap = 90,
  progressInterval = 120,
  now = () => performance.now(),
  setTimer = (fn, ms) => window.setTimeout(fn, ms),
  clearTimer = (id) => window.clearTimeout(id),
  setInterval = (fn, ms) => window.setInterval(fn, ms),
  clearInterval = (id) => window.clearInterval(id),
}: Options) {
  let showTimer: number | null = null
  let hideTimer: number | null = null
  let progressTimer: number | null = null
  let visibleSince: number | null = null
  let progress = 0

  const cancel = (id: number | null) => {
    if (id !== null) clearTimer(id)
  }

  const stopProgress = () => {
    if (progressTimer !== null) clearInterval(progressTimer)
    progressTimer = null
  }

  return {
    start() {
      cancel(hideTimer)
      hideTimer = null
      if (visibleSince !== null || showTimer !== null) return
      showTimer = setTimer(() => {
        showTimer = null
        visibleSince = now()
        progress = 0
        onProgress?.(progress)
        show()
        progressTimer = setInterval(() => {
          progress += (progressCap - progress) * 0.1
          onProgress?.(progress)
        }, progressInterval)
      }, delay)
    },
    done() {
      if (showTimer !== null) {
        cancel(showTimer)
        showTimer = null
        return
      }
      if (visibleSince === null || hideTimer !== null) return
      stopProgress()
      onProgress?.(100)
      const wait = Math.max(0, minVisible - (now() - visibleSince))
      const finish = () => {
        hideTimer = null
        visibleSince = null
        hide()
      }
      if (wait === 0) finish()
      else hideTimer = setTimer(finish, wait)
    },
  }
}
