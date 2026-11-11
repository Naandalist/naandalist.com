import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

// A flock that flies across the profile card. Classic boids (separation, alignment, cohesion)
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

interface Bird {
  x: number
  y: number
  vx: number
  vy: number
  phase: number
  mix: number
}

type Rgb = [number, number, number]
// Warm Vanta look: orange, pink, cream and yellow birds. The same palette reads on dark and light glass.
const STOPS: Rgb[] = [[255, 140, 70], [255, 105, 185], [255, 232, 225], [255, 205, 110], [235, 90, 150]]

function tint(m: number): string {
  const t = m * (STOPS.length - 1)
  const i = Math.min(Math.floor(t), STOPS.length - 2)
  const f = t - i
  const [a, b] = [STOPS[i], STOPS[i + 1]]
  return `rgb(${Math.round(a[0] + (b[0] - a[0]) * f)},${Math.round(a[1] + (b[1] - a[1]) * f)},${Math.round(a[2] + (b[2] - a[2]) * f)})`
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

    const resize = () => {
      const r = host.getBoundingClientRect()
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

    const step = () => {
      for (const b of birds) {
        let sx = 0, sy = 0, ax = 0, ay = 0, cx = 0, cy = 0, n = 0
        for (const o of birds) {
          if (o === b) continue
          const dx = o.x - b.x
          const dy = o.y - b.y
          const d = Math.hypot(dx, dy)
          if (d > VIEW) continue
          n++
          ax += o.vx
          ay += o.vy
          cx += o.x
          cy += o.y
          if (d < SEPARATION && d > 0) {
            sx -= dx / d / d
            sy -= dy / d / d
          }
        }
        let fx = sx * 30
        let fy = sy * 30
        if (n) {
          fx += (ax / n - b.vx) * 0.6 + (cx / n - b.x) * 0.0006
          fy += (ay / n - b.vy) * 0.6 + (cy / n - b.y) * 0.0006
        }
        const pdx = b.x - pointer.x
        const pdy = b.y - pointer.y
        const pd = Math.hypot(pdx, pdy)
        if (pd < FLEE) {
          fx += (pdx / pd) * ((FLEE - pd) / FLEE) * 1.2
          fy += (pdy / pd) * ((FLEE - pd) / FLEE) * 1.2
        }
        const f = Math.hypot(fx, fy)
        if (f > MAX_FORCE) {
          fx = (fx / f) * MAX_FORCE
          fy = (fy / f) * MAX_FORCE
        }
        b.vx += fx
        b.vy += fy
        limit(b, SPEED_LIMIT)
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
      for (const b of birds) {
        const flap = Math.sin(b.phase) * 0.9
        const ang = Math.atan2(b.vy, b.vx)
        ctx.save()
        ctx.translate(b.x, b.y)
        ctx.rotate(ang)
        ctx.fillStyle = tint(b.mix)
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
    ro.observe(host)

    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect()
      pointer.x = e.clientX - r.left
      pointer.y = e.clientY - r.top
    }
    const onLeave = () => {
      pointer.x = pointer.y = -9999
    }
    host.addEventListener('pointermove', onMove)
    host.addEventListener('pointerleave', onLeave)

    if (reduced) {
      for (let i = 0; i < 40; i++) step()
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
    const tick = () => {
      step()
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
    io.observe(host)
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
