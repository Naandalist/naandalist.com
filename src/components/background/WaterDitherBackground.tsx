import { useEffect, useRef, useState } from 'react'
import { useWaterDither } from '@/hooks/useWaterDither'

const SRC = '/assets/sea.webp'
const SIZE: [number, number] = [851, 360]
const IDLE_FALLBACK_MS = 10000
const WAKE_EVENTS = ['pointermove', 'pointerdown', 'scroll', 'keydown', 'touchstart'] as const

function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useWaterDither(canvasRef, { src: SRC, imageSize: SIZE, rippleSpeed: 0.25 })

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      tabIndex={-1}
      style={{ opacity: 0 }}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-[0.1] transition-opacity duration-700 dark:opacity-[0.09]"
    />
  )
}

/**
 * Fixed, decorative background. Not interactive, so it is hidden from assistive tech.
 * WebGL setup is costly on the main thread, so it waits for the first user input or a long idle.
 */
export default function WaterDitherBackground() {
  const [active, setActive] = useState(false)

  useEffect(() => {
    let timer = 0
    const wake = () => {
      cleanup()
      setActive(true)
    }
    const cleanup = () => {
      window.clearTimeout(timer)
      for (const e of WAKE_EVENTS) window.removeEventListener(e, wake)
    }
    for (const e of WAKE_EVENTS) window.addEventListener(e, wake, { passive: true, once: true })
    timer = window.setTimeout(wake, IDLE_FALLBACK_MS)
    return cleanup
  }, [])

  return active ? <Canvas /> : null
}
