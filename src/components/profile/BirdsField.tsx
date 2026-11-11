import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

// A flock that flies across its canvas (the empty band of the profile card). Classic boids (separation, alignment, cohesion)
// drawn in 2D canvas, with the pointer acting as a predator the birds steer away from.
// Same look as the Vanta "birds" effect, without three.js.

const BIRDS = 28
const SPEED_LIMIT = 1.6
const MAX_FORCE = 0.04
const VIEW = 70
const SEPARATION = 26
const FLEE = 110
const WING = 9
const MAX_DPR = 2
// Every so often the flock tightens into a dense ball and swoops through a diving turn.
const CALM_MIN = 5000
const CALM_MAX = 11000
const SWARM_MS = 4200

interface Bird {
  x: number
  y: number
  vx: number
  vy: number
  phase: number
  mix: number
}

// Grayscale flock: light greys on the dark glass, dark greys on the light glass.
function tint(m: number, dark: boolean): string {
  const v = Math.round(dark ? 150 + 105 * m : 25 + 90 * m)
  return `rgb(${v},${v},${v})`
}

function limit(b: Bird, max: number) {
  const s = Math.hypot(b.vx, b.vy)
  if (s > max) {
    b.vx = (b.vx / s) * max
    b.vy = (b.vy / s) * max
  }
}

/** Decorative flock of birds. Hidden from assistive tech, stills for reduced motion. */
export default function BirdsField({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const host = canvas?.parentElement
    const ctx = canvas?.getContext('2d')
    if (!canvas || !host || !ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let w = 0
    let h = 0
    let dpr = 1
    const pointer = { x: -9999, y: -9999 }
    const birds: Bird[] = Array.from({ length: BIRDS }, () => {
      const a = Math.random() * Math.PI * 2
      return { x: 0, y: 0, vx: Math.cos(a), vy: Math.sin(a), phase: Math.random() * 6.28, mix: Math.random() }
    })
    let seeded = false
    // Swarm moment: k eases 0 -> 1 -> 0 over SWARM_MS. While it is above 0 the flock is drawn to a target that sweeps a dive.
    let nextSwarm = performance.now() + 2500 + Math.random() * 3000
    let swarmStart = -1
    let k = 0
    let tx = 0
    let ty = 0
    let dir = 1

    const resize = () => {
      const r = canvas.getBoundingClientRect()
      w = r.width
      h = r.height
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      if (!seeded && w > 0) {
        for (const b of birds) {
          b.x = Math.random() * w
          b.y = Math.random() * h
        }
        seeded = true
      }
    }

    const step = (now: number) => {
      if (swarmStart < 0 && now > nextSwarm) {
        swarmStart = now
        dir = Math.random() < 0.5 ? 1 : -1
      }
      if (swarmStart >= 0) {
        const u = (now - swarmStart) / SWARM_MS
        if (u >= 1) {
          swarmStart = -1
          k = 0
          nextSwarm = now + CALM_MIN + Math.random() * (CALM_MAX - CALM_MIN)
        } else {
          k = Math.sin(u * Math.PI)
          // Sweep across the band while rising, then dive to the bottom and pull up.
          tx = w * (0.5 + dir * 0.38 * Math.cos(u * Math.PI * 1.6))
          ty = h * (0.5 - 0.42 * Math.cos(u * Math.PI * 3.2))
        }
      }
      const limitSpeed = SPEED_LIMIT + k * 1.6
      const maxForce = MAX_FORCE + k * 0.06
      for (const b of birds) {
        let sx = 0, sy = 0, ax = 0, ay = 0, cx = 0, cy = 0, n = 0
        for (const o of birds) {
          if (o === b) continue
          const dx = o.x - b.x
          const dy = o.y - b.y
          const d = Math.hypot(dx, dy)
          if (d > VIEW * (1 + k * 2)) continue
          n++
          ax += o.vx
          ay += o.vy
          cx += o.x
          cy += o.y
          if (d < SEPARATION * (1 - k * 0.5) && d > 0) {
            sx -= dx / d / d
            sy -= dy / d / d
          }
        }
        let fx = sx * 30
        let fy = sy * 30
        if (n) {
          fx += (ax / n - b.vx) * (0.6 + k * 0.8) + (cx / n - b.x) * (0.0006 + k * 0.004)
          fy += (ay / n - b.vy) * (0.6 + k * 0.8) + (cy / n - b.y) * (0.0006 + k * 0.004)
        }
        if (k > 0) {
          fx += (tx - b.x) * 0.0016 * k
          fy += (ty - b.y) * 0.0016 * k
        }
        const pdx = b.x - pointer.x
        const pdy = b.y - pointer.y
        const pd = Math.hypot(pdx, pdy)
        if (pd < FLEE) {
          fx += (pdx / pd) * ((FLEE - pd) / FLEE) * 1.2
          fy += (pdy / pd) * ((FLEE - pd) / FLEE) * 1.2
        }
        const f = Math.hypot(fx, fy)
        if (f > maxForce) {
          fx = (fx / f) * maxForce
          fy = (fy / f) * maxForce
        }
        b.vx += fx
        b.vy += fy
        limit(b, limitSpeed)
        // Keep a minimum cruise speed so the flock never stalls.
        const s = Math.hypot(b.vx, b.vy)
        if (s < 0.7 && s > 0) {
          b.vx = (b.vx / s) * 0.7
          b.vy = (b.vy / s) * 0.7
        }
        b.x += b.vx
        b.y += b.vy
        // Wrap with a margin so birds glide out one side and in from the other.
        if (b.x < -20) b.x = w + 20
        else if (b.x > w + 20) b.x = -20
        if (b.y < -20) b.y = h + 20
        else if (b.y > h + 20) b.y = -20
        b.phase += 0.12 + s * 0.06
      }
    }

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      const dark = document.documentElement.classList.contains('dark')
      for (const b of birds) {
        const flap = Math.sin(b.phase) * 0.9
        const ang = Math.atan2(b.vy, b.vx)
        ctx.save()
        ctx.translate(b.x, b.y)
        ctx.rotate(ang)
        ctx.fillStyle = tint(b.mix, dark)
        ctx.globalAlpha = 0.9
        // Body and two wings. The wings swing about the body axis as the bird flaps.
        ctx.beginPath()
        ctx.moveTo(WING * 0.9, 0)
        ctx.lineTo(-WING * 0.5, WING * 0.18)
        ctx.lineTo(-WING * 0.5, -WING * 0.18)
        ctx.closePath()
        ctx.fill()
        for (const side of [1, -1]) {
          ctx.beginPath()
          ctx.moveTo(WING * 0.2, 0)
          ctx.lineTo(-WING * 0.7, side * WING * (0.35 + flap * 0.9))
          ctx.lineTo(-WING * 0.9, side * WING * (0.1 + flap * 0.3))
          ctx.closePath()
          ctx.fill()
        }
        ctx.restore()
      }
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      pointer.x = e.clientX - r.left
      pointer.y = e.clientY - r.top
    }
    const onLeave = () => {
      pointer.x = pointer.y = -9999
    }
    host.addEventListener('pointermove', onMove)
    host.addEventListener('pointerleave', onLeave)

    if (reduced) {
      for (let i = 0; i < 40; i++) step(0)
      draw()
      canvas.style.opacity = '1'
      return () => {
        ro.disconnect()
        host.removeEventListener('pointermove', onMove)
        host.removeEventListener('pointerleave', onLeave)
      }
    }

    let raf = 0
    let visible = true
    const tick = (now: number) => {
      step(now)
      draw()
      raf = requestAnimationFrame(tick)
    }
    const sync = () => {
      cancelAnimationFrame(raf)
      if (visible && !document.hidden) raf = requestAnimationFrame(tick)
    }
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      sync()
    })
    io.observe(canvas)
    document.addEventListener('visibilitychange', sync)
    canvas.style.opacity = '1'
    sync()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', sync)
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      tabIndex={-1}
      style={{ opacity: 0 }}
      className={cn('pointer-events-none transition-opacity duration-700', className)}
    />
  )
}
