/**
 * Baby's breath (gypsophila) as a density field, in grid cells.
 * A plant is not a tree: it has no trunk. Five to seven wiry stems fan out from the same low point,
 * curve back toward the sky, and carry thin side twigs that fork into hair-fine stalks. Each stalk ends
 * in a tiny flower, so the whole plant reads as a loose cloud of white dots held up by broken
 * hairlines. Dithering turns the thin lines into dotted ones, which is what makes the look.
 * Wind blows left to right: a gust wave travels across the plants and everything leans a little to
 * the right, more the higher it is. A crowd of loose petals is blown the same way.
 * Everything is pure. The canvas only compares density with a Bayer threshold.
 */

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a))
  return t * t * (3 - 2 * t)
}
const frac = (v: number) => v - Math.floor(v)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** Where the plants stand (fraction of width) and how tall they grow (fraction of the band). */
export const PLANTS = [
  { x: 0.1, h: 0.72 },
  { x: 0.3, h: 0.86 },
  { x: 0.52, h: 0.7 },
  { x: 0.73, h: 0.88 },
  { x: 0.92, h: 0.74 },
] as const

export const PETAL_COUNT = 28
const STEM_POINTS = 7

function hash(x: number, y: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return s - Math.floor(s)
}

function valueNoise(x: number, y: number): number {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const fx = x - xi
  const fy = y - yi
  const sx = fx * fx * (3 - 2 * fx)
  const sy = fy * fy * (3 - 2 * fy)
  return lerp(lerp(hash(xi, yi), hash(xi + 1, yi), sx), lerp(hash(xi, yi + 1), hash(xi + 1, yi + 1), sx), sy)
}

export interface Seg {
  x0: number
  y0: number
  x1: number
  y1: number
  /** 0 stem, 1 side twig, 2 hair-fine stalk. */
  depth: number
}
export interface Tip {
  x: number
  y: number
  baseX: number
}
export interface Flower {
  x: number
  y: number
  /** 1 is a single bright cell, 2 is a full blossom drawn as a small plus. */
  size: 1 | 2
}
export interface Geometry {
  segs: Seg[]
  tips: Tip[]
  flowers: Flower[]
}

/** The plants at rest. Built once per size, then bent by the wind for each frame. */
const skeletons = new Map<string, Geometry>()

function skeleton(cols: number, rows: number): Geometry {
  const key = `${cols}x${rows}`
  const cached = skeletons.get(key)
  if (cached) return cached
  const out: Geometry = { segs: [], tips: [], flowers: [] }

  const cluster = (x: number, y: number, id: number, baseX: number, count: number) => {
    out.tips.push({ x, y, baseX })
    for (let k = 0; k < count; k++) {
      out.flowers.push({
        x: x + (hash(id, k + 0.3) - 0.5) * 2.4,
        y: y + (hash(id, k + 0.9) - 0.5) * 2,
        size: hash(id, k + 1.7) > 0.78 ? 2 : 1,
      })
    }
  }

  PLANTS.forEach((plant, pi) => {
    const baseX = plant.x * cols
    const height = plant.h * rows * 0.8
    const stems = 6 + Math.floor(hash(pi, 4.4) * 2)

    for (let k = 0; k < stems; k++) {
      const sid = pi * 100 + k
      // Lean of this stem from the vertical, spread evenly to both sides.
      const lean = ((k / (stems - 1)) - 0.5) * 1.3 + (hash(sid, 1.1) - 0.5) * 0.25
      const reach = height * (0.72 + hash(sid, 2.2) * 0.28)
      let x = baseX + (hash(sid, 3.3) - 0.5) * 2
      let y = rows - 1

      for (let i = 1; i <= STEM_POINTS; i++) {
        // The stem curves back toward the vertical as it rises.
        const theta = lean * (1 - 0.42 * (i / STEM_POINTS)) + (hash(sid, 5 + i) - 0.5) * 0.14
        const step = reach / STEM_POINTS
        const nx = x + Math.sin(theta) * step
        const ny = y - Math.cos(theta) * step
        out.segs.push({ x0: x, y0: y, x1: nx, y1: ny, depth: 0 })

        // Thin side twigs start from the upper half of the stem and alternate left and right.
        if (i >= 4) {
          const side = (i + k) % 2 === 0 ? 1 : -1
          const tid = sid * 10 + i
          const ta = theta + side * (0.7 + hash(tid, 1.5) * 0.5)
          const tl = 3.5 + hash(tid, 2.5) * 4.5
          const mx = nx + Math.sin(ta) * tl * 0.55
          const my = ny - Math.cos(ta) * tl * 0.55
          const ex = mx + Math.sin(ta + side * 0.25) * tl * 0.45
          const ey = my - Math.cos(ta + side * 0.25) * tl * 0.45
          out.segs.push({ x0: nx, y0: ny, x1: mx, y1: my, depth: 1 })
          out.segs.push({ x0: mx, y0: my, x1: ex, y1: ey, depth: 1 })
          // The twig forks into two hair-fine stalks, each carrying a small cluster of flowers.
          for (const f of [-1, 1]) {
            const fa = ta + f * (0.45 + hash(tid, 3.5 + f) * 0.3)
            const fl = 2 + hash(tid, 4.5 + f) * 2.5
            const fx = ex + Math.sin(fa) * fl
            const fy = ey - Math.cos(fa) * fl
            out.segs.push({ x0: ex, y0: ey, x1: fx, y1: fy, depth: 2 })
            cluster(fx, fy, tid * 7 + f, baseX, 1 + Math.floor(hash(tid, 6.5 + f) * 2.2))
          }
        }
        x = nx
        y = ny
      }
      cluster(x, y, sid * 13, baseX, 3)
    }
  })

  skeletons.set(key, out)
  return out
}

/** Wind: how far a point at (x, y) is pushed to the right at time t (seconds), in cells. */
function wind(x: number, y: number, t: number, rows: number): number {
  const height = clamp01((rows - 1 - y) / (rows * 0.85))
  const gust = Math.sin(t * 0.9 - x * 0.045) * 0.7 + Math.sin(t * 0.37 + x * 0.02) * 0.3
  return (gust * 2.2 + 0.9) * Math.pow(height, 1.5)
}

/** Stems and flowers of every plant at time t (seconds). */
export function plantGeometry(cols: number, rows: number, t: number): Geometry {
  const rest = skeleton(cols, rows)
  const bend = (x: number, y: number) => x + wind(x, y, t, rows)
  return {
    segs: rest.segs.map((s) => ({ ...s, x0: bend(s.x0, s.y0), x1: bend(s.x1, s.y1) })),
    tips: rest.tips.map((p) => ({ ...p, x: bend(p.x, p.y) })),
    flowers: rest.flowers.map((f) => ({ ...f, x: bend(f.x, f.y) })),
  }
}

export interface Petal {
  x: number
  y: number
  alpha: number
}

/** A loose petal blown from the left edge to the right, each at its own height and speed. */
export function petalAt(i: number, t: number, cols: number, rows: number): Petal {
  const speed = 0.035 + hash(i, 1.9) * 0.12
  const p = frac(hash(i, 7.7) + t * speed + 0.02 * Math.sin(t * 0.9 + i))
  const altitude = rows * (0.25 + hash(i, 2.9) * 0.5)
  const arc = rows * 0.1 * (0.3 + hash(i, 3.9) * 0.7)
  return {
    x: lerp(-2, cols + 4, p),
    y: altitude - Math.sin(p * Math.PI) * arc + Math.sin(t * 1.9 + i * 2.3) * 1.2,
    alpha: smoothstep(0, 0.08, p) * (1 - smoothstep(0.85, 1, p)),
  }
}

/** The dithered mound the plants grow from. It does not move, so compute it once per size. */
export function groundField(cols: number, rows: number): Float32Array {
  const f = new Float32Array(cols * rows)
  for (let r = 0; r < rows; r++) {
    const base = smoothstep(0.84, 1, r / rows)
    if (base === 0) continue
    for (let c = 0; c < cols; c++) f[r * cols + c] = base * (0.15 + 0.25 * valueNoise(c * 0.35, r * 0.5))
  }
  return f
}

function plot(buf: Float32Array, cols: number, rows: number, x: number, y: number, v: number) {
  const xi = Math.round(x)
  const yi = Math.round(y)
  if (xi < 0 || xi >= cols || yi < 0 || yi >= rows) return
  const i = yi * cols + xi
  if (v > buf[i]) buf[i] = v
}

function line(buf: Float32Array, cols: number, rows: number, s: Seg) {
  // Stems are thin and the finest stalks thinner still. At these densities dithering breaks them into
  // dotted hairlines, so the bright flowers stand out as the white dots they are.
  const v = s.depth === 0 ? (s.y0 > rows * 0.6 ? 0.4 : 0.6) : s.depth === 1 ? 0.45 : 0.36
  const steps = Math.max(1, Math.ceil(Math.hypot(s.x1 - s.x0, s.y1 - s.y0) * 2))
  for (let k = 0; k <= steps; k++) {
    const u = k / steps
    plot(buf, cols, rows, lerp(s.x0, s.x1, u), lerp(s.y0, s.y1, u), v)
  }
}

function flower(buf: Float32Array, cols: number, rows: number, f: Flower) {
  plot(buf, cols, rows, f.x, f.y, 1)
  if (f.size === 2) {
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) plot(buf, cols, rows, f.x + dx, f.y + dy, 0.85)
  }
}

/** One frame: ground, then stems, then flowers, then the petals in the air. Values are 0..1 per cell. */
export function compose(cols: number, rows: number, t: number, ground?: Float32Array): Float32Array {
  const buf = ground ? Float32Array.from(ground) : groundField(cols, rows)
  const g = plantGeometry(cols, rows, t)
  for (const s of g.segs) line(buf, cols, rows, s)
  for (const f of g.flowers) flower(buf, cols, rows, f)
  for (let i = 0; i < PETAL_COUNT; i++) {
    const p = petalAt(i, t, cols, rows)
    if (p.alpha < 0.05) continue
    plot(buf, cols, rows, p.x, p.y, p.alpha)
    plot(buf, cols, rows, p.x - 1, p.y, p.alpha * 0.6)
    plot(buf, cols, rows, p.x - 2, p.y, p.alpha * 0.3)
    // Some petals tumble: a second cell flips above and below the head.
    if (hash(i, 5.5) > 0.5) plot(buf, cols, rows, p.x - 1, p.y + (Math.sin(t * 4 + i) > 0 ? -1 : 1), p.alpha * 0.55)
  }
  return buf
}
