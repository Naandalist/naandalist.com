import { useEffect, useRef, useState } from 'react'

const WAKE_EVENTS = ['pointermove', 'pointerdown', 'scroll', 'keydown', 'touchstart'] as const
const IDLE_FALLBACK_MS = 10000
const FRAME_MS = 70
/** Dots snap to this grid in CSS px, to match the dithered look used elsewhere on the site. */
const CELL = 3
const STARS = 4500
const FIELD = 700
const ARMS = 4
const TILT = 0.42
const ROLL = -0.5
/** Size of the glow sprite in px. It is scaled up when drawn, so it only needs to be smooth. */
const GLOW_SIZE = 256

/** Small seeded generator so the galaxy is the same on every load and every resize. */
function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface Star {
  /** Distance from the core, 0..1. */
  r: number
  /** Angle at time zero. */
  a: number
  /** 0 faint, 1 medium, 2 bright. */
  tier: number
}

function makeStars(): Star[] {
  const rand = rng(9)
  const out: Star[] = []
  for (let i = 0; i < STARS; i++) {
    // Most stars sit near the core, so density falls off smoothly toward the rim.
    const r = rand() ** 1.25
    const arm = Math.floor(rand() * ARMS)
    // Logarithmic spiral: the angle winds with the radius. Scatter widens a little outward.
    const scatter = (rand() - 0.5) * (0.7 + r * 1.3)
    const a = (arm * Math.PI * 2) / ARMS + r * 4.6 + scatter
    const tier = rand() > 0.97 ? 2 : rand() > 0.8 ? 1 : 0
    out.push({ r, a, tier })
  }
  return out
}

function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const startedAt = performance.now()
    const stars = makeStars()
    const fieldRand = rng(41)
    const field = Array.from({ length: FIELD }, () => [fieldRand(), fieldRand(), fieldRand() > 0.9 ? 1 : 0])
    const cosR = Math.cos(ROLL)
    const sinR = Math.sin(ROLL)
    let color = ''
    let glow: HTMLCanvasElement | null = null
    let w = 0
    let h = 0
    let raf = 0
    let last = 0
    let disposed = false

    /** Paints the glow once per colour: an eased alpha falloff, then tinted with the star colour. */
    const buildGlow = () => {
      const sprite = document.createElement('canvas')
      sprite.width = GLOW_SIZE
      sprite.height = GLOW_SIZE
      const g = sprite.getContext('2d')
      if (!g) return
      const mid = GLOW_SIZE / 2
      const grad = g.createRadialGradient(mid, mid, 0, mid, mid, mid)
      for (let i = 0; i <= 16; i++) {
        const x = i / 16
        grad.addColorStop(x, `rgba(0, 0, 0, ${(1 - x) ** 2.2})`)
      }
      g.fillStyle = grad
      g.fillRect(0, 0, GLOW_SIZE, GLOW_SIZE)
      g.globalCompositeOperation = 'source-in'
      g.fillStyle = color
      g.fillRect(0, 0, GLOW_SIZE, GLOW_SIZE)
      glow = sprite
    }

    const resize = () => {
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = Math.max(1, Math.round(w * dpr))
      canvas.height = Math.max(1, Math.round(h * dpr))
      color = getComputedStyle(canvas).color
      buildGlow()
    }

    const draw = (t: number) => {
      if (disposed || w === 0) return
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.fillStyle = color
      const cx = w * 0.66
      const cy = h * 0.58
      const R = Math.max(w, h) * 0.85

      // Glowing core: one smooth radial sprite, tilted like the disc. It breathes a little.
      if (glow) {
        const pulse = 1 + 0.06 * Math.sin(t * 0.9)
        const rr = R * 0.4 * pulse
        ctx.save()
        ctx.translate(cx, cy)
        ctx.rotate(ROLL)
        ctx.scale(1, TILT * 1.8)
        ctx.globalAlpha = 0.7
        ctx.drawImage(glow, -rr, -rr, rr * 2, rr * 2)
        ctx.restore()
      }

      const bucket: number[][] = [[], [], []]
      for (const s of stars) {
        // Inner stars turn faster than outer ones, so the arms slowly wind.
        const ang = s.a - t * (0.02 / (0.25 + s.r))
        const x = Math.cos(ang) * s.r * R
        const y = Math.sin(ang) * s.r * R * TILT
        const px = Math.round((cx + x * cosR - y * sinR) / CELL) * CELL
        const py = Math.round((cy + x * sinR + y * cosR) / CELL) * CELL
        bucket[s.tier].push(px, py)
      }
      // Loose stars scattered over the whole screen, standing still.
      for (const f of field) bucket[f[2]].push(Math.round((f[0] * w) / CELL) * CELL, Math.round((f[1] * h) / CELL) * CELL)
      const size = [CELL - 1, CELL - 1, CELL]
      const alpha = [0.5, 0.75, 1]
      for (let tier = 0; tier < 3; tier++) {
        ctx.globalAlpha = alpha[tier]
        const b = bucket[tier]
        for (let i = 0; i < b.length; i += 2) ctx.fillRect(b[i], b[i + 1], size[tier], size[tier])
      }
      ctx.globalAlpha = 1
    }

    const time = (now: number) => (now - startedAt) / 1000
    const loop = (now: number) => {
      raf = 0
      if (disposed || document.hidden) return
      if (now - last >= FRAME_MS) {
        last = now
        draw(time(now))
      }
      raf = requestAnimationFrame(loop)
    }
    const start = () => {
      if (reduceMotion || raf || disposed || document.hidden) return
      raf = requestAnimationFrame(loop)
    }
    const stop = () => {
      if (raf) cancelAnimationFrame(raf)
      raf = 0
    }

    resize()
    draw(0)
    canvas.style.removeProperty('opacity')
    start()

    const ro = new ResizeObserver(() => {
      resize()
      draw(time(performance.now()))
    })
    ro.observe(canvas)
    const mo = new MutationObserver(() => {
      color = getComputedStyle(canvas).color
      buildGlow()
      draw(time(performance.now()))
    })
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    const onVisibility = () => (document.hidden ? stop() : start())
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      disposed = true
      stop()
      ro.disconnect()
      mo.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      tabIndex={-1}
      style={{ opacity: 0 }}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full text-foreground opacity-[0.3] transition-opacity duration-700 dark:opacity-[0.35]"
    />
  )
}

/**
 * Fixed, decorative spiral galaxy that turns very slowly, drawn as snapped dots.
 * Hidden from assistive tech. Setup waits for the first user input or a long idle.
 */
export default function GalaxyBackground() {
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
