import { useEffect, type RefObject } from 'react'
import { bayer4 } from '@/lib/bayer'
import * as babysBreath from '@/lib/babys-breath'
import * as dandelion from '@/lib/dandelion'

const SCENES = { 'babys-breath': babysBreath, dandelion } as const
export type Scene = keyof typeof SCENES

interface Options {
  /** Cell size in CSS px */
  cell?: number
  /** Redraw interval in ms while animating */
  frameInterval?: number
  /** Time in seconds used for the still frame, chosen so a petal or two is already in the air */
  still?: number
  /** Set false for a static picture: the still frame is drawn once and the wind never starts. */
  animate?: boolean
  /**
   * Horizon effect: plants grow from this fraction of their height at the left edge (far away)
   * to full height at the right edge (near). Omit for a flat band.
   */
  perspective?: number
  /** Which plant to draw. */
  scene?: Scene
}

/**
 * Draws the dithered baby's breath band. A still frame is drawn first, then the wind
 * starts after the page has loaded and the browser is idle. It stops offscreen,
 * on hidden tabs, and for reduced motion.
 */
export function useBabysBreath(canvasRef: RefObject<HTMLCanvasElement | null>, { cell = 3, frameInterval = 40, still = 2.4, animate = true, perspective, scene = 'babys-breath' }: Options = {}) {
  const { compose, groundField } = SCENES[scene]
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    // With a perspective the field is drawn flat to a scratch canvas, then squeezed strip by strip.
    const scratch = perspective === undefined ? null : document.createElement('canvas')
    const scratchCtx = scratch?.getContext('2d') ?? null

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const startedAt = performance.now()
    let cols = 0
    let rows = 0
    let ground: Float32Array = new Float32Array(0)
    let color = ''
    let raf = 0
    let last = 0
    let disposed = false
    let onScreen = true
    let animating = false

    const readColor = () => {
      color = getComputedStyle(canvas).color
    }

    const resize = () => {
      // Layout size, not getBoundingClientRect: the rect shrinks while the card is tilted or mid-transition.
      const rect = { width: canvas.clientWidth, height: canvas.clientHeight }
      canvas.width = Math.max(1, Math.round(rect.width * dpr))
      canvas.height = Math.max(1, Math.round(rect.height * dpr))
      if (scratch) {
        scratch.width = canvas.width
        scratch.height = canvas.height
      }
      cols = Math.floor(rect.width / cell)
      rows = Math.floor(rect.height / cell)
      ground = groundField(cols, rows)
    }

    const paint = (target: CanvasRenderingContext2D, t: number) => {
      target.clearRect(0, 0, canvas.width, canvas.height)
      target.fillStyle = color
      const px = cell * dpr
      const dot = Math.max(1, px - dpr)
      const field = compose(cols, rows, t, ground)
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (field[r * cols + c] > bayer4(c, r)) target.fillRect(c * px, r * px, dot, dot)
        }
      }
    }

    const draw = (t: number) => {
      if (disposed || cols === 0 || rows === 0) return
      if (!scratch || !scratchCtx || perspective === undefined) return paint(ctx, t)
      paint(scratchCtx, t)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.imageSmoothingEnabled = false
      const strip = Math.max(2, Math.round(3 * dpr))
      for (let sx = 0; sx < canvas.width; sx += strip) {
        const u = (sx + strip / 2) / canvas.width
        const k = perspective + (1 - perspective) * Math.pow(u, 1.3)
        const dh = canvas.height * k
        ctx.drawImage(scratch, sx, 0, strip, canvas.height, sx, canvas.height - dh, strip, dh)
      }
    }

    const time = (now: number) => still + (now - startedAt) / 1000

    const loop = (now: number) => {
      raf = 0
      if (disposed || !onScreen || document.hidden) return
      if (now - last >= frameInterval) {
        last = now
        draw(time(now))
      }
      raf = requestAnimationFrame(loop)
    }
    const start = () => {
      if (!animating || raf || !onScreen || document.hidden) return
      raf = requestAnimationFrame(loop)
    }
    const stop = () => {
      if (raf) cancelAnimationFrame(raf)
      raf = 0
    }

    readColor()
    resize()
    draw(still)
    canvas.style.removeProperty('opacity')

    const begin = () => {
      if (disposed || reduceMotion || !animate) return
      animating = true
      start()
    }
    const scheduleBegin = () => {
      const idle = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback
      if (idle) idle(begin, { timeout: 1500 })
      else window.setTimeout(begin, 300)
    }
    if (document.readyState === 'complete') scheduleBegin()
    else window.addEventListener('load', scheduleBegin, { once: true })

    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting
      if (onScreen) start()
      else stop()
    })
    io.observe(canvas)

    const ro = new ResizeObserver(() => {
      resize()
      draw(animating ? time(performance.now()) : still)
    })
    ro.observe(canvas)

    const mo = new MutationObserver(() => {
      readColor()
      draw(animating ? time(performance.now()) : still)
    })
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    const onVisibility = () => (document.hidden ? stop() : start())
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      disposed = true
      stop()
      io.disconnect()
      ro.disconnect()
      mo.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [canvasRef, cell, frameInterval, still, animate, perspective, compose, groundField])
}
