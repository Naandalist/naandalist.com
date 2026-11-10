import { useEffect, useRef, useState } from 'react'
import { startFluid } from './fluid-atmosphere'

const WAKE_EVENTS = ['pointermove', 'pointerdown', 'scroll', 'keydown', 'touchstart'] as const
const IDLE_FALLBACK_MS = 10000

const isDark = () => document.documentElement.classList.contains('dark')

function Clouds() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [shown, setShown] = useState(false)
  const [fallback, setFallback] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const stop = startFluid(canvas, () => setFallback(true))
    // Waits one frame so the first draw lands before the fade-in starts.
    const raf = requestAnimationFrame(() => setShown(true))
    return () => {
      cancelAnimationFrame(raf)
      stop()
    }
  }, [])

  return (
    <div
      aria-hidden="true"
      className={`fluid-bg pointer-events-none fixed inset-0 z-0${shown ? ' is-on' : ''}${fallback ? ' is-fallback' : ''}`}
    >
      {!fallback && (
        <canvas ref={canvasRef} tabIndex={-1} className="absolute inset-0 h-full w-full" />
      )}
    </div>
  )
}

/**
 * Fixed, decorative fluid clouds behind every page, in dark mode only. Light mode never
 * creates the WebGL context. Setup waits for the first user input or a long idle.
 */
export default function FluidBackground() {
  const [awake, setAwake] = useState(false)
  const [dark, setDark] = useState(false)

  useEffect(() => {
    let timer = 0
    const wake = () => {
      cleanup()
      setAwake(true)
    }
    const cleanup = () => {
      window.clearTimeout(timer)
      for (const e of WAKE_EVENTS) window.removeEventListener(e, wake)
    }
    for (const e of WAKE_EVENTS) window.addEventListener(e, wake, { passive: true, once: true })
    timer = window.setTimeout(wake, IDLE_FALLBACK_MS)
    return cleanup
  }, [])

  useEffect(() => {
    setDark(isDark())
    const mo = new MutationObserver(() => setDark(isDark()))
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => mo.disconnect()
  }, [])

  return awake && dark ? <Clouds /> : null
}
