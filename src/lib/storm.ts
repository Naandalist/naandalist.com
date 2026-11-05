/**
 * A ship in a storm as a density field, in grid cells.
 * Three layers of rolling waves tower and cross each other, a small ship rides the main swell —
 * hull, mast, and a bulging sail, all pitching with the slope of the water — while gulls cross
 * the sky above and thin rain slants through the whole scene. Everything loops forever.
 * Everything is pure. The canvas only compares density with a Bayer threshold.
 */

const frac = (v: number) => v - Math.floor(v)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

function hash(x: number, y: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return s - Math.floor(s)
}

/** Scale reference: every size below is drawn for a 48 row band and scaled by this. */
const K = (rows: number) => rows / 48

/** The rolling waves: how high they sit, how tall they tower, their length, speed, and ink. */
export const WAVES = [
  { base: 0.66, amp: 5, kx: 0.09, speed: 0.9, v: 0.5 },
  { base: 0.76, amp: 6.5, kx: 0.07, speed: -0.65, v: 0.75 },
  { base: 0.84, amp: 4.5, kx: 0.12, speed: 1.25, v: 0.42 },
] as const

/** The height of one wave layer at column x and time t. The main swell (the second) carries the ship. */
export function seaSurface(x: number, t: number, rows: number, layer = 1): number {
  const w = WAVES[layer]
  const k = K(rows)
  return rows * w.base + Math.sin(x * w.kx + t * w.speed) * w.amp * k + Math.sin(x * w.kx * 2.7 - t * w.speed * 1.6) * w.amp * 0.3 * k
}

export interface Ship {
  x: number
  /** Waterline of the hull, riding the main swell. */
  y: number
  /** How far the bow is pitched up, in radians. */
  tilt: number
  mastX: number
  mastY: number
}

/** Where the ship rides: it bobs on the swell and pitches with the slope of the water. */
export function shipAt(cols: number, rows: number, t: number): Ship {
  const k = K(rows)
  const x = cols * 0.52
  const y = seaSurface(x, t, rows) - 0.5 * k
  const slope = (seaSurface(x + 2, t, rows) - seaSurface(x - 2, t, rows)) / 4
  const tilt = Math.atan(slope) * 0.6 + Math.sin(t * 1.1) * 0.05
  const mast = 11 * k
  return { x, y, tilt, mastX: x - mast * Math.sin(tilt), mastY: y - mast * Math.cos(tilt) }
}

/** The gulls crossing the sky above the waves, each at its own height, pace, and size. */
export const GULLS = [
  { y: 0.14, speed: 0.075, phase: 0.1, amp: 2.5, s: 1 },
  { y: 0.22, speed: 0.058, phase: 0.45, amp: 3, s: 0.8 },
  { y: 0.08, speed: 0.09, phase: 0.8, amp: 2, s: 0.6 },
] as const

export const GULL_COUNT = GULLS.length

export interface Gull {
  x: number
  y: number
  /** How far the wings are lifted, from -1 (down) to 1 (up). */
  flap: number
  s: number
  alpha: number
}

/** One gull: it glides across the band like the dandelion seeds do, bobbing, wings beating. */
export function gullAt(i: number, t: number, cols: number, rows: number): Gull {
  const g = GULLS[i % GULLS.length]
  const k = K(rows)
  const p = frac(t * g.speed + g.phase)
  return {
    x: p * (cols + 10) - 5,
    y: rows * g.y + Math.sin(t * 1.9 + g.phase * 9) * g.amp * k,
    flap: Math.sin(t * 7 + g.phase * 5),
    s: g.s,
    alpha: Math.sin(p * Math.PI),
  }
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
  for (let n = 0; n <= steps; n++) {
    const u = n / steps
    plot(buf, cols, rows, lerp(x0, x1, u), lerp(y0, y1, u), v)
  }
}

/** One wave layer: a crest line with foam on the peaks, and a sparse speckle filling the body below. */
function waveLayer(buf: Float32Array, cols: number, rows: number, t: number, layer: number) {
  const w = WAVES[layer]
  const _k = K(rows)
  for (let c = 0; c < cols; c++) {
    const y = seaSurface(c, t, rows, layer)
    const crest = Math.sin(c * w.kx + t * w.speed)
    plot(buf, cols, rows, c, y, crest > 0.8 ? Math.min(1, w.v * 1.4) : w.v)
    plot(buf, cols, rows, c, y + 1, w.v * 0.55)
    plot(buf, cols, rows, c, y + 2, w.v * 0.28)
    for (let r = Math.ceil(y) + 3; r < rows; r += 3) {
      if (hash(c * 5.3, r * 9.1 + Math.floor(t * 2)) > 0.72) plot(buf, cols, rows, c, r, w.v * 0.3)
    }
  }
}

/** The ship: hull outline with ribs, a mast with a pennant, a bowsprit, and a sail that bellies in the wind. */
function ship(buf: Float32Array, cols: number, rows: number, t: number) {
  const k = K(rows)
  const s = shipAt(cols, rows, t)
  // Local point (u: forward, v: up), rotated by the pitch of the hull.
  const px = (u: number, v: number) => s.x + u * Math.cos(s.tilt) - v * Math.sin(s.tilt)
  const py = (u: number, v: number) => s.y - u * Math.sin(s.tilt) - v * Math.cos(s.tilt)

  // Hull: deck from stern to bow tip, then down to the waterline and back along the keel.
  line(buf, cols, rows, px(-4.5 * k, -1.2 * k), py(-4.5 * k, -1.2 * k), px(5 * k, -1.8 * k), py(5 * k, -1.8 * k), 0.85)
  line(buf, cols, rows, px(5 * k, -1.8 * k), py(5 * k, -1.8 * k), px(3.8 * k, 1 * k), py(3.8 * k, 1 * k), 0.85)
  line(buf, cols, rows, px(3.8 * k, 1 * k), py(3.8 * k, 1 * k), px(-3.6 * k, 1 * k), py(-3.6 * k, 1 * k), 0.85)
  line(buf, cols, rows, px(-3.6 * k, 1 * k), py(-3.6 * k, 1 * k), px(-4.5 * k, -1.2 * k), py(-4.5 * k, -1.2 * k), 0.85)
  for (let u = -3; u <= 3.5; u += 1.5) {
    line(buf, cols, rows, px(u * k, 0.9 * k), py(u * k, 0.9 * k), px(u * k * 0.92, -1.3 * k), py(u * k * 0.92, -1.3 * k), 0.4)
  }

  // Mast and the little pennant that snaps at its top.
  line(buf, cols, rows, px(0, -1.4 * k), py(0, -1.4 * k), s.mastX, s.mastY, 0.9)
  line(buf, cols, rows, s.mastX, s.mastY, s.mastX + 2 * k + Math.sin(t * 9) * 0.5 * k, s.mastY + 0.3 * k, 0.7)

  // Bowsprit reaching over the bow.
  line(buf, cols, rows, px(5 * k, -1.8 * k), py(5 * k, -1.8 * k), px(7.5 * k, -3 * k), py(7.5 * k, -3 * k), 0.8)

  // The sail: horizontal cloth lines from the mast, bellying toward the bow, fluttering.
  const sailTop = -9.5 * k
  const sailBottom = -4 * k
  for (let v = sailTop; v <= sailBottom; v += 0.45 * k) {
    const u0 = 0.15 * k
    const bulge = Math.sin(((v - sailTop) / (sailBottom - sailTop)) * Math.PI) * 2.8 * k * (0.85 + 0.15 * Math.sin(t * 3.3 + v))
    line(buf, cols, rows, px(u0, v), py(u0, v), px(u0 + bulge, v - 0.4 * k), py(u0 + bulge, v - 0.4 * k), 0.5)
  }
}

/** One gull: a body dot with two long wings that beat above it. */
function gull(buf: Float32Array, cols: number, rows: number, g: Gull) {
  const k = K(rows)
  const v = 0.9 * g.alpha
  const span = 2.4 * k * g.s
  const tipY = g.y - span * g.flap * 0.55 - 0.2 * k
  line(buf, cols, rows, g.x, g.y, g.x - span, tipY, v)
  line(buf, cols, rows, g.x, g.y, g.x + span, tipY, v)
  line(buf, cols, rows, g.x - span, tipY, g.x - span * 1.25, tipY + 0.8 * k, v * 0.8)
  line(buf, cols, rows, g.x + span, tipY, g.x + span * 1.25, tipY + 0.8 * k, v * 0.8)
  plot(buf, cols, rows, g.x, g.y, v)
}

/** Thin rain slanting through the whole scene with the wind, fading in at the top and out below. */
function rain(buf: Float32Array, cols: number, rows: number, t: number) {
  const k = K(rows)
  for (let i = 0; i < 16; i++) {
    const p = frac(t * (0.55 + hash(i, 1.1) * 0.25) + hash(i, 2.7))
    const x = frac(hash(i, 3.3)) * (cols + 30) - 15 + p * rows * 0.5
    const y = -2 + p * (rows + 4)
    line(buf, cols, rows, x, y, x + 1.2 * k, y + 2.6 * k, 0.28 * Math.sin(p * Math.PI))
  }
}

/** The sea never rests, so nothing is static: the ground is empty and every frame is drawn fresh. */
export function groundField(cols: number, rows: number): Float32Array {
  return new Float32Array(cols * rows)
}

/** One frame: rain, the back waves, the gulls, the main swell, the ship, and the front waves over the hull. Values are 0..1 per cell. */
export function compose(cols: number, rows: number, t: number, ground?: Float32Array): Float32Array {
  const buf = ground ? Float32Array.from(ground) : groundField(cols, rows)
  rain(buf, cols, rows, t)
  waveLayer(buf, cols, rows, t, 0)
  for (let i = 0; i < GULL_COUNT; i++) {
    const g = gullAt(i, t, cols, rows)
    if (g.alpha >= 0.05) gull(buf, cols, rows, g)
  }
  waveLayer(buf, cols, rows, t, 1)
  ship(buf, cols, rows, t)
  waveLayer(buf, cols, rows, t, 2)
  return buf
}
