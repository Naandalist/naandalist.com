/**
 * Timing for the page-change loader. It appears only if a navigation takes longer than `delay`, so
 * fast page changes never flash it, and once shown it stays for at least `minVisible` so it does not blink.
 * The DOM work is passed in as show and hide, which keeps this logic testable.
 */

interface Options {
  show: () => void
  hide: () => void
  /** Wait before showing, in ms. */
  delay?: number
  /** Shortest time to stay visible once shown, in ms. */
  minVisible?: number
  now?: () => number
  setTimer?: (fn: () => void, ms: number) => number
  clearTimer?: (id: number) => void
}

export function createNavLoader({
  show,
  hide,
  delay = 150,
  minVisible = 400,
  now = () => performance.now(),
  setTimer = (fn, ms) => window.setTimeout(fn, ms),
  clearTimer = (id) => window.clearTimeout(id),
}: Options) {
  let showTimer: number | null = null
  let hideTimer: number | null = null
  let visibleSince: number | null = null

  const cancel = (id: number | null) => {
    if (id !== null) clearTimer(id)
  }

  return {
    start() {
      cancel(hideTimer)
      hideTimer = null
      if (visibleSince !== null || showTimer !== null) return
      showTimer = setTimer(() => {
        showTimer = null
        visibleSince = now()
        show()
      }, delay)
    },
    done() {
      if (showTimer !== null) {
        cancel(showTimer)
        showTimer = null
        return
      }
      if (visibleSince === null || hideTimer !== null) return
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
