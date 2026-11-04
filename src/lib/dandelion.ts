/**
 * A dandelion as a density field, in grid cells.
 * A round head of fine radial filaments around a hollow middle, a long stem, two toothed leaves, and
 * a handful of loose seeds blown from the head to the right. Each seed is a thin tail with a small fan
 * of bristles at its top. Dithering turns the thin lines into dotted ones.
 * Everything is pure. The canvas only compares density with a Bayer threshold.
 */

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a))
  return t * t * (3 - 2 * t)
}
const frac = (v: number) => v - Math.floor(v)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

function hash(x: number, y: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return s - Math.floor(s)
}

/** Where each dandelion stands (fraction of width) and how big it is next to the first one. */
export const PLANTS = [
  { x: 0.12, s: 1 },
  { x: 0.29, s: 0.6 },
  { x: 0.43, s: 0.78 },
  { x: 0.55, s: 0.5 },
  { x: 0.64, s: 0.38 },
] as const

/** The plant each seed comes from. Big plants shed more, and a small plant sheds small seeds. */
const SEED_PLANT = [0, 1, 2, 0, 3, 0, 1, 4, 2, 0, 3, 1, 0, 2, 4, 0, 1, 3]
export const SEED_COUNT = SEED_PLANT.length

export interface Head {
  cx: number
  cy: number
  r: number
}

/**
 * Where the head of plant `p` sits. The first plant is full size and scales with the band height, so it
 * keeps its shape at any width. The others are the same plant shrunk toward the ground.
 */
export function headGeometry(cols: number, rows: number, p = 0): Head {
  const r0 = Math.min(rows * 0.3, cols * 0.12)
  const cy0 = r0 + rows * 0.05
  const { x, s } = PLANTS[p]
  const ground = rows - 1
  return { cx: Math.max(r0 + 2, cols * x), cy: ground - (ground - cy0) * s, r: r0 * s }
}

/** How far the wind pushes a point at height y, in cells. */
function lean(y: number, t: number, rows: number): number {
  const height = clamp01((rows - 1 - y) / rows)
  return (Math.sin(t * 0.9) * 0.8 + 0.8) * height * height * 2
}

export interface Seed {
  x: number
  y: number
  /** Tilt of the seed in radians, 0 is pointing straight up. */
  tilt: number
  /** Size next to the biggest plant's seeds. */
  scale: number
  alpha: number
}

/** A seed leaves the head, rises on the wind, and drifts to the right edge. */
export function seedAt(i: number, t: number, cols: number, rows: number): Seed {
  const plant = SEED_PLANT[i % SEED_COUNT]
  const h = headGeometry(cols, rows, plant)
  const speed = 0.045 + hash(i, 1.3) * 0.07
  const p = frac(hash(i, 4.1) + t * speed)
  const startAngle = -0.2 - hash(i, 2.7) * 1.1
  const sx = h.cx + Math.cos(startAngle) * h.r * 0.85
  const sy = h.cy + Math.sin(startAngle) * h.r * 0.85
  const endY = rows * (0.12 + hash(i, 5.9) * 0.62)
  const ease = 1 - Math.pow(1 - p, 1.6)
  return {
    x: lerp(sx, cols + 6, p),
    y: lerp(sy, endY, ease) + Math.sin(t * 1.6 + i * 2.1) * 0.9,
    tilt: 0.55 + Math.sin(t * 1.3 + i) * 0.25,
    scale: PLANTS[plant].s,
    alpha: smoothstep(0, 0.06, p) * (1 - smoothstep(0.88, 1, p)),
  }
}

/** The ground line the stem stands on. It does not move, so compute it once per size. */
export function groundField(cols: number, rows: number): Float32Array {
  const f = new Float32Array(cols * rows)
  PLANTS.forEach((_, p) => {
    const h = headGeometry(cols, rows, p)
    const x0 = Math.round(h.cx - h.r * 0.9)
    const x1 = Math.round(h.cx + h.r * 0.9)
    for (let c = Math.max(0, x0); c <= Math.min(cols - 1, x1); c++) f[(rows - 1) * cols + c] = 0.7
  })
  return f
}

function plot(buf: Float32Array, cols: number, rows: number, x: number, y: number, v: number) {
  const xi = Math.round(x)
  const yi = Math.round(y)
  if (xi < 0 || xi >= cols || yi < 0 || yi >= rows) return
  const i = yi * cols + xi
  if (v > buf[i]) buf[i] = v
}

function line(buf: Float32Array, cols: number, rows: number, x0: number, y0: number, x1: number, y1: number, v: number) {
  const steps = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 2))
  for (let k = 0; k <= steps; k++) {
    const u = k / steps
    plot(buf, cols, rows, lerp(x0, x1, u), lerp(y0, y1, u), v)
  }
}

/** The puffball: fine filaments around a hollow middle, bright at the rim, with a few strands standing out. */
function head(buf: Float32Array, cols: number, rows: number, h: Head, t: number) {
  const dx = lean(h.cy, t, rows)
  const cx = h.cx + dx
  const spokes = Math.max(14, Math.floor(h.r * 3.2))
  for (let r = Math.floor(h.cy - h.r - 2); r <= Math.ceil(h.cy + h.r + 2); r++) {
    for (let c = Math.floor(cx - h.r - 2); c <= Math.ceil(cx + h.r + 2); c++) {
      const ox = c - cx
      const oy = r - h.cy
      const d = Math.hypot(ox, oy) / h.r
      if (d < 0.2 || d > 1) continue
      const spoke = Math.pow(0.5 + 0.5 * Math.cos(Math.atan2(oy, ox) * spokes), 2)
      const body = (0.5 + 0.45 * spoke) * (1 - smoothstep(0.82, 1, d)) * (0.55 + 0.45 * smoothstep(0.2, 0.55, d))
      plot(buf, cols, rows, c, r, body)
    }
  }
  // The rim: each filament ends in a small bright tuft.
  for (let k = 0; k < spokes; k++) {
    const a = (k / spokes) * Math.PI * 2 + (hash(k, 8.2) - 0.5) * 0.08
    const len = h.r * (0.93 + hash(k, 3.3) * 0.1)
    plot(buf, cols, rows, cx + Math.cos(a) * len, h.cy + Math.sin(a) * len, 1)
  }
}

/** The stem curves a little, then the two leaves reach out from its foot with toothed edges. */
function stem(buf: Float32Array, cols: number, rows: number, h: Head, t: number, size: number) {
  const baseX = h.cx - h.r * 0.1
  const top = h.cy + h.r * 0.9
  const bottom = rows - 1
  for (let y = top; y <= bottom; y += 0.5) {
    const u = (y - top) / (bottom - top)
    const bow = Math.sin(u * Math.PI) * -1.2
    const x = lerp(h.cx + lean(h.cy, t, rows), baseX, u) + bow + lean(y, t, rows) * (1 - u) * 0.2
    plot(buf, cols, rows, x, y, 0.85)
    plot(buf, cols, rows, x + 1, y, 0.55)
  }
  const leaf = (dir: -1 | 1, length: number, lift: number) => {
    const n = Math.ceil(length * 2)
    for (let k = 0; k <= n; k++) {
      const u = k / n
      const x = baseX + dir * u * length
      const y = bottom - Math.pow(u, 1.5) * lift
      // Widest in the first half, pointed at the tip, with a tooth every few cells.
      const width = Math.sin(Math.min(1, u * 1.15) * Math.PI) * (lift * 0.26) * (1 + 0.35 * Math.sin(u * 22))
      for (let w = 0; w <= width; w += 0.5) plot(buf, cols, rows, x, y - w, 0.72)
    }
  }
  leaf(-1, h.r * 1.2, rows * 0.5 * size)
  leaf(1, h.r * 1.6, rows * 0.42 * size)
}

/** One flying seed: a thin tail, and a small fan of bristles at its top end. */
function seed(buf: Float32Array, cols: number, rows: number, s: Seed, i: number) {
  // Drawn for a 48 row band and scaled for finer grids.
  const k = (rows / 48) * s.scale * 0.85
  const dir = { x: Math.sin(s.tilt), y: -Math.cos(s.tilt) }
  const len = (4.5 + hash(i, 6.1) * 3) * k
  line(buf, cols, rows, s.x - dir.x * len, s.y - dir.y * len, s.x, s.y, s.alpha * 0.8)
  for (let n = -2; n <= 2; n++) {
    const a = s.tilt + n * 0.42
    const bl = (2.4 + hash(i, n + 9) * 1.4) * k
    line(buf, cols, rows, s.x, s.y, s.x + Math.sin(a) * bl, s.y - Math.cos(a) * bl, s.alpha * 0.9)
    plot(buf, cols, rows, s.x + Math.sin(a) * (bl + k), s.y - Math.cos(a) * (bl + k), s.alpha)
  }
}

/** Short blades of grass along the ground. They sway on the same wind, so the bottom is never still. */
function grass(buf: Float32Array, cols: number, rows: number, t: number) {
  const k = rows / 48
  for (let x = 1; x < cols; x += 2 + Math.floor(hash(x, 2.2) * 2)) {
    const tall = (2.5 + hash(x, 9.1) * 4.5) * k
    const sway = (Math.sin(t * 1.3 - x * 0.07) * 0.5 + 0.7) * tall * 0.35
    const bow = (hash(x, 3.7) - 0.5) * tall * 0.3
    const steps = Math.ceil(tall * 2)
    for (let n = 0; n <= steps; n++) {
      const u = n / steps
      plot(buf, cols, rows, x + (sway + bow) * u * u, rows - 1 - tall * u, 0.5 - 0.15 * u)
    }
  }
}

/** One frame: ground, then leaves and stem, then the head, then the seeds in the air. Values are 0..1 per cell. */
export function compose(cols: number, rows: number, t: number, ground?: Float32Array): Float32Array {
  const buf = ground ? Float32Array.from(ground) : groundField(cols, rows)
  grass(buf, cols, rows, t)
  PLANTS.forEach((plant, p) => {
    const h = headGeometry(cols, rows, p)
    stem(buf, cols, rows, h, t, plant.s)
    head(buf, cols, rows, h, t)
  })
  for (let i = 0; i < SEED_COUNT; i++) {
    const s = seedAt(i, t, cols, rows)
    if (s.alpha >= 0.05) seed(buf, cols, rows, s, i)
  }
  return buf
}
