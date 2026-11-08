/**
 * A mountain climb, as a density field in grid cells.
 * Three hikers with backpacks, caps and trekking poles climb a steep trail that rises from the
 * left edge to the right. The trail goes up in steps, steep pitches with short easier stretches
 * between, and the hikers lean into every pitch. The line is always spread from one side of the
 * band to the other, and when a hiker leaves at the right edge the same hiker comes back in on the
 * left, so the loop has no seam.
 * Leaves drift down on a light breeze. Twice a lap a strong wind comes up all at once from the right: curling
 * streaks rush across, a flurry of leaves is torn loose and flung leftward, and the hikers lean into it.
 * Behind them a faint far ridge and a soft bank of clouds, kept very thin so the hikers still read clearly.
 * Everything is pure. The canvas only compares density with a Bayer threshold.
 */

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const frac = (v: number) => v - Math.floor(v)
/** 0 below a, 1 above b, smooth in between. */
const smooth = (a: number, b: number, x: number) => {
  const u = clamp01((x - a) / (b - a))
  return u * u * (3 - 2 * u)
}
function hash(x: number, y: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return s - Math.floor(s)
}

/** Scale reference: every size below is drawn for a 48 row band and scaled by this. */
const K = (rows: number) => rows / 48

/** The row the slope starts on at the left edge. */
export const groundRow = (rows: number) => rows - 4 * K(rows)

/** Length of one step of the trail, in 48 row units: a steep pitch, then an easier stretch. */
const STEP_LEN = 70
/** How much of the climb the whole trail makes, in 48 row units. */
const RISE = 30

/** The trail the hikers climb: row of its surface at column x. It rises to the right in steps. */
export function ridgeY(cols: number, rows: number, x: number): number {
  const k = K(rows)
  const period = STEP_LEN * k
  // Height gained is steady on average, with the climb coming in bursts: the pitch is up to 1.9 times the average and never flat.
  const rise = RISE * k * (x / cols + (0.95 * period * Math.sin((Math.PI * 2 * x) / period)) / (Math.PI * 2 * cols))
  return groundRow(rows) - rise
}

/** How steep the slope is at x: rise over run, uphill positive. */
const steepness = (cols: number, rows: number, x: number) => (ridgeY(cols, rows, x - 1) - ridgeY(cols, rows, x + 1)) / 2

type Pt = [number, number]

/** The far ridge, behind the slope. */
const farY = (rows: number, x: number, shift: number, lift: number) => {
  const k = K(rows)
  return rows * lift + 5 * k * Math.sin((x / k) * 0.035 + shift) + 3 * k * Math.sin((x / k) * 0.09 + shift * 2.3)
}

/** Hikers on the line. */
const COUNT = 3
/** Cells per second along the trail on the flat, before it is slowed by the pitch. */
const TRAIL_SPEED = 11
/** Past each edge, so that the hikers wrap round out of sight. */
const MARGIN = 16

/** The hikers are drawn this much bigger than the band's scale, so they read from a distance. */
const BODY = 0.82
/** Each hiker is a little taller or shorter than the next. */
const SCALE = [1, 0.94, 1.04]

/** Time against distance along the slope: slower on the steep pitches. */
const timelines = new Map<string, { x0: number; step: number; cum: Float32Array }>()
function timeline(cols: number, rows: number) {
  const key = `${cols}x${rows}`
  const hit = timelines.get(key)
  if (hit) return hit
  const k = K(rows)
  const x0 = -MARGIN * k
  const step = 0.5
  const n = Math.ceil((cols + 2 * MARGIN * k) / step)
  const cum = new Float32Array(n + 1)
  for (let j = 0; j < n; j++) {
    const x = x0 + (j + 0.5) * step
    cum[j + 1] = cum[j] + (step * (1 + 4 * Math.max(0, steepness(cols, rows, x)))) / (TRAIL_SPEED * k)
  }
  const made = { x0, step, cum }
  timelines.set(key, made)
  return made
}

/** Seconds for one hiker to go from the left edge to the right edge. Everything loops on this. */
export function cycleOf(cols: number, rows: number): number {
  const { cum } = timeline(cols, rows)
  return cum[cum.length - 1]
}

/** Where a hiker is a given way, 0..1, through its time on the slope. */
function xAtPhase(cols: number, rows: number, phase: number): number {
  const { x0, step, cum } = timeline(cols, rows)
  const target = phase * cum[cum.length - 1]
  let lo = 0
  let hi = cum.length - 1
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1
    if (cum[mid] <= target) lo = mid
    else hi = mid
  }
  return x0 + (lo + (target - cum[lo]) / (cum[hi] - cum[lo] || 1)) * step
}

/**
 * The strong winds: where in the lap each one starts, and for how many seconds it blows. Their
 * leaves and streaks are still crossing the band for a few seconds after. Everything about a gust
 * depends only on the time since it began, so the loop closes exactly.
 */
const GUSTS = [
  { at: 0.2, dur: 5 },
  { at: 0.68, dur: 4.2 },
] as const
/** Seconds after a gust dies that its leaves are still flying. */
const GUST_TAIL = 5

export interface Gust {
  index: number
  /** Seconds since it began. */
  clock: number
  /** How hard it blows, 0..1: it slams in within a second, holds, and drops away. */
  strength: number
}

/** The gust in progress at time t, or null while the air is calm. */
export function gustAt(t: number, cols: number, rows: number): Gust | null {
  const cycle = cycleOf(cols, rows)
  for (let index = 0; index < GUSTS.length; index++) {
    const g = GUSTS[index]
    const clock = frac(t / cycle - g.at) * cycle
    if (clock < g.dur + GUST_TAIL) {
      return { index, clock, strength: smooth(0, 0.6, clock) * (1 - smooth(g.dur - 1.4, g.dur, clock)) }
    }
  }
  return null
}

/** How much a full gust holds the hikers back: at its height they make this share less headway. */
const WIND_DRAG = 0.68

/** Strength of wind added up over the lap, so the time lost to it can be shared out evenly. */
const windTotals = new Map<string, { dt: number; cum: Float32Array }>()
function windTotal(cols: number, rows: number) {
  const key = `${cols}x${rows}`
  const hit = windTotals.get(key)
  if (hit) return hit
  const cycle = cycleOf(cols, rows)
  const n = Math.ceil(cycle / 0.05)
  const dt = cycle / n
  const cum = new Float32Array(n + 1)
  for (let j = 0; j < n; j++) cum[j + 1] = cum[j] + (gustAt((j + 0.5) * dt, cols, rows)?.strength ?? 0) * dt
  const made = { dt, cum }
  windTotals.set(key, made)
  return made
}

/**
 * How far along the slope the line has come at time t, in laps. A gust holds the hikers back, and
 * the time it costs is made up gently over the rest of the lap, so a lap still takes exactly one
 * lap and the loop has no seam.
 */
export function progressAt(t: number, cols: number, rows: number): number {
  const cycle = cycleOf(cols, rows)
  const { dt, cum } = windTotal(cols, rows)
  const laps = Math.floor(t / cycle)
  const tc = t - laps * cycle
  const j = Math.min(cum.length - 2, Math.floor(tc / dt))
  const held = lerp(cum[j], cum[j + 1], (tc - j * dt) / dt)
  const total = cum[cum.length - 1]
  return laps + (tc - WIND_DRAG * (held - (total * tc) / cycle)) / cycle
}

export interface Hiker {
  i: number
  /** Where the hiker stands, in columns. */
  x: number
  size: number
  /** Stride phase, radians: it follows the ground covered, so the feet do not slide. */
  stride: number
  hip: Pt
  feet: Pt[]
  knees: Pt[]
  shoulder: Pt
  head: Pt
  elbows: Pt[]
  hands: Pt[]
}

// Body proportions, for a 48 row band.
const LEG1 = 4.4
const LEG2 = 4.4
const TORSO = 5.2
const NECK = 0.5
const HEAD_R = 1.7
const ARM1 = 3
const ARM2 = 3
/** How far each stride carries a hiker, in 48 row units. */
const STRIDE_LEN = 12
const dir = (a: number): Pt => [Math.sin(a), Math.cos(a)]

interface Rig {
  hip: Pt
  feet: Pt[]
  knees: Pt[]
  shoulder: Pt
  head: Pt
  elbows: Pt[]
  hands: Pt[]
}

/** Walking the trail: legs swinging, knees lifted for the climb, hands swinging against them with a pole each. */
function walking(cols: number, rows: number, x: number, s: number, th: number, wind: number): Rig {
  const slope = Math.atan(steepness(cols, rows, x))
  // Into the wind, the hikers lean harder.
  const lean = 0.32 + 0.6 * slope + 0.4 * wind
  const legs = [th, th + Math.PI].map((p) => {
    const a = 0.12 + 0.4 * Math.sin(p)
    // Bracing against the wind: knees bent deeper, each step dragged up with effort.
    const bendBy = 0.3 + 0.35 * wind + (0.85 + 0.3 * wind) * Math.max(0, Math.cos(p))
    const d1 = dir(a)
    const knee: Pt = [d1[0] * LEG1 * s, d1[1] * LEG1 * s]
    const d2 = dir(a - bendBy)
    return { knee, foot: [knee[0] + d2[0] * LEG2 * s, knee[1] + d2[1] * LEG2 * s] as Pt }
  })
  // The hip rides at the height that keeps both feet on the slope.
  const hipY = Math.min(...legs.map((l) => ridgeY(cols, rows, x + l.foot[0]) - l.foot[1]))
  const at = ([dx, dy]: Pt): Pt => [x + dx, hipY + dy]
  const up: Pt = [Math.sin(lean), -Math.cos(lean)]
  const shoulder: Pt = [up[0] * TORSO * s, up[1] * TORSO * s]
  const head: Pt = [up[0] * (TORSO + NECK + HEAD_R) * s, up[1] * (TORSO + NECK + HEAD_R) * s]
  const arms = [th + Math.PI, th].map((p) => {
    const a = 0.35 + 0.7 * Math.sin(p)
    const d1 = dir(a)
    const elbow: Pt = [shoulder[0] + d1[0] * ARM1 * s, shoulder[1] + d1[1] * ARM1 * s]
    const d2 = dir(a + 1)
    return { elbow, hand: [elbow[0] + d2[0] * ARM2 * s, elbow[1] + d2[1] * ARM2 * s] as Pt }
  })
  return {
    hip: at([0, 0]),
    feet: legs.map((l) => at(l.foot)),
    knees: legs.map((l) => at(l.knee)),
    shoulder: at(shoulder),
    head: at(head),
    elbows: arms.map((a) => at(a.elbow)),
    hands: arms.map((a) => at(a.hand)),
  }
}

/** The hikers at time t, from left to right along the slope. */
export function hikersAt(t: number, cols: number, rows: number): Hiker[] {
  const k = K(rows)
  const wind = gustAt(t, cols, rows)?.strength ?? 0
  const progress = progressAt(t, cols, rows)
  const out: Hiker[] = []
  for (let i = 0; i < COUNT; i++) {
    const x = xAtPhase(cols, rows, frac(i / COUNT + progress))
    const size = SCALE[i % SCALE.length]
    const s = k * size * BODY
    // Steps follow the ground covered, so the feet do not slide.
    const walk = ((Math.PI * 2) / (STRIDE_LEN * s)) * x + hash(i, 1.3) * 6
    const a = walking(cols, rows, x, s, walk, wind)
    out.push({ i, x, size, stride: walk, ...a })
  }
  return out
}

function plot(buf: Float32Array, cols: number, rows: number, x: number, y: number, v: number) {
  const xi = Math.round(x)
  const yi = Math.round(y)
  if (xi < 0 || xi >= cols || yi < 0 || yi >= rows) return
  const i = yi * cols + xi
  if (v > buf[i]) buf[i] = v
}

/** A thick stroke: discs stamped along the segment. */
function stroke(buf: Float32Array, cols: number, rows: number, a: Pt, b: Pt, w: number, v: number) {
  const steps = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) * 2))
  const r = Math.max(0.35, w / 2)
  for (let n = 0; n <= steps; n++) {
    const u = n / steps
    const cx = lerp(a[0], b[0], u)
    const cy = lerp(a[1], b[1], u)
    for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) {
      for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
        if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r + 0.25) plot(buf, cols, rows, x, y, v)
      }
    }
  }
}

/** One hiker: far limbs and pole dimmer, then the pack, torso, head and cap. */
function hiker(buf: Float32Array, cols: number, rows: number, h: Hiker) {
  if (h.x < -20 || h.x > cols + 20) return
  const s = K(rows) * h.size * BODY
  const line = (a: Pt, b: Pt, w: number, v: number) => stroke(buf, cols, rows, a, b, w * s, v)
  for (const i of [1, 0]) {
    const v = i === 1 ? 0.6 : 1
    line(h.hip, h.knees[i], 1.6, v)
    line(h.knees[i], h.feet[i], 1.5, v)
    line(h.shoulder, h.elbows[i], 1.4, v)
    line(h.elbows[i], h.hands[i], 1.3, v)
    // A trekking pole from the hand, angled back, stopping where it meets the slope.
    const hand = h.hands[i]
    const pa = -0.45 - 0.35 * Math.sin(h.stride + (i === 0 ? Math.PI : 0))
    const [dx, dy] = dir(pa)
    let end: Pt = hand
    for (let m = 0; m <= 10 * s; m += 0.5) {
      end = [hand[0] + dx * m, hand[1] + dy * m]
      if (end[1] >= ridgeY(cols, rows, end[0])) break
    }
    stroke(buf, cols, rows, [hand[0] - dx * 1.5 * s, hand[1] - dy * 1.5 * s], end, 0.5 * s, v * 0.85)
  }
  line(h.hip, h.shoulder, 2.6, 1)

  // The pack on the back: an oval along the spine, sitting behind it.
  const lean = Math.atan2(h.shoulder[0] - h.hip[0], h.hip[1] - h.shoulder[1])
  const sx = Math.sin(lean)
  const sy = -Math.cos(lean)
  const mid: Pt = [(h.hip[0] + h.shoulder[0]) / 2, (h.hip[1] + h.shoulder[1]) / 2]
  const pack: Pt = [mid[0] - Math.cos(lean) * 2.5 * s, mid[1] - Math.sin(lean) * 2.5 * s]
  for (let a = -3.3; a <= 3.3; a += 0.4) {
    const half = 2.1 * Math.sqrt(1 - (a / 3.3) ** 2)
    for (let c = -half; c <= half; c += 0.4) {
      plot(buf, cols, rows, pack[0] + (sx * a - Math.cos(lean) * c * 0.5) * s, pack[1] + (sy * a - Math.sin(lean) * c * 0.5) * s, 1)
    }
  }
  // Head and a cap with its brim out front.
  stroke(buf, cols, rows, h.head, h.head, 2 * HEAD_R * s, 1)
  stroke(buf, cols, rows, [h.head[0] - 0.4 * s, h.head[1] - 1.2 * s], [h.head[0] + 2.8 * s, h.head[1] - 0.9 * s], 0.9 * s, 1)
}

/** The slope: a rising surface with a gradient under it, and gravel scattered along it. */
export function groundField(cols: number, rows: number): Float32Array {
  const buf = new Float32Array(cols * rows)
  const k = K(rows)
  // A faint far ridge wash, thin enough that hikers stay readable.
  for (const [shift, lift, v] of [[1.3, 0.3, 0.035]] as const) {
    for (let x = 0; x < cols; x++) {
      const top = farY(rows, x, shift, lift)
      for (let y = Math.max(0, Math.round(top)); y < rows; y++) plot(buf, cols, rows, x, y, y === Math.round(top) ? v + 0.045 : v)
    }
  }
  for (let x = 0; x < cols; x++) {
    const top = ridgeY(cols, rows, x)
    for (let y = Math.max(0, Math.round(top)); y < rows; y++) {
      const depth = (y - top) / (rows - top + 1)
      plot(buf, cols, rows, x, y, y === Math.round(top) ? 0.95 : 0.55 - 0.3 * depth)
    }
    // Stones on the slope.
    if (hash(x * 1.7, 3.3) < 0.12) plot(buf, cols, rows, x, top - 0.8 - hash(x, 9.1) * 0.8 * k, 0.7)
  }
  return buf
}

/** A cloud bank drifting across the sky behind the slope, soft and very faint. */
function clouds(buf: Float32Array, cols: number, rows: number, t: number) {
  const k = K(rows)
  const span = cols + 60 * k
  for (let j = 0; j < 12; j++) {
    const h = (n: number) => hash(j * 4.1 + n, n * 1.7 + 0.5)
    const cx = frac(h(1) + t / cycleOf(cols, rows)) * span - 30 * k
    const cy = rows * (0.08 + 0.4 * h(2))
    const rx = (9 + 12 * h(3)) * k
    const ry = (2.4 + 2.6 * h(4)) * k
    for (const [ox, oy, sz] of [
      [0, 0, 1],
      [-0.6, 0.35, 0.7],
      [0.55, 0.3, 0.75],
    ] as const) {
      const px = cx + ox * rx
      const py = cy + oy * ry
      for (let y = Math.floor(py - ry * sz); y <= Math.ceil(py + ry * sz); y++) {
        for (let x = Math.floor(px - rx * sz); x <= Math.ceil(px + rx * sz); x++) {
          const d = ((x - px) / (rx * sz)) ** 2 + ((y - py) / (ry * sz)) ** 2
          if (d < 1) plot(buf, cols, rows, x, y, 0.12 * (1 - d))
        }
      }
    }
  }
}

/** A leaf: a small pointed oval growing out from its stem along its angle (y up). */
function leafShape(buf: Float32Array, cols: number, rows: number, x: number, y: number, angle: number, size: number, v: number) {
  const ca = Math.cos(angle)
  const sa = Math.sin(angle)
  const mx = x + ca * size * 0.5
  const my = y - sa * size * 0.5
  for (let a = -size / 2; a <= size / 2; a += 0.35) {
    const half = size * 0.32 * Math.sqrt(Math.max(0, 1 - ((2 * a) / size) ** 2))
    for (let c = -half; c <= half; c += 0.35) plot(buf, cols, rows, mx + a * ca - c * sa, my - a * sa - c * ca, v)
  }
}

/** Leaves on the breeze: each falls from the top of the band to the slope, swaying and drifting left, then comes round again. */
const BREEZE_LEAVES = 16
function breeze(buf: Float32Array, cols: number, rows: number, t: number) {
  const k = K(rows)
  const cycle = cycleOf(cols, rows)
  for (let i = 0; i < BREEZE_LEAVES; i++) {
    const h = (n: number) => hash(i * 3.17 + n, n * 7.3 + 1.1)
    // A whole number of falls per lap, so every leaf is back where it started.
    const q = frac((t * (2 + (i % 2))) / cycle + h(1))
    const x = h(2) * (cols + 30 * k) - q * (8 + 14 * h(3)) * k + Math.sin(q * 16 + h(4) * 6) * 2.6 * k
    const y = lerp(-2 * k, ridgeY(cols, rows, x) - 1, q ** 1.2)
    const fade = q < 0.05 ? q / 0.05 : q > 0.9 ? (1 - q) / 0.1 : 1
    leafShape(buf, cols, rows, x, y, Math.sin(q * 16 + h(4) * 6) * 1.1 + h(5) * 3, 2.6 * k, 0.9 * fade)
  }
}

export interface Leaf {
  x: number
  y: number
  angle: number
}

/** How many leaves a gust tears loose. */
export const burstCount = (cols: number) => Math.round(cols / 10)

/**
 * One leaf torn loose by a gust, or null while it is still to come or has gone. They let go one
 * after another from the right edge and race left, tumbling and tossed up and down.
 */
export function burstLeafAt(j: number, t: number, cols: number, rows: number): Leaf | null {
  const gust = gustAt(t, cols, rows)
  if (!gust) return null
  const k = K(rows)
  const h = (n: number) => hash(j * 5.31 + n + gust.index * 17, n * 2.9 + 4.4)
  const age = gust.clock - 0.1 - h(1) * GUSTS[gust.index].dur * 0.55
  if (age < 0) return null
  const x = cols + 8 * k - age * (55 + 55 * h(2)) * k
  if (x < -6 * k) return null
  const y = lerp(2, ridgeY(cols, rows, x) - 1.5, 0.12 + 0.8 * h(3)) + Math.sin(age * (5 + 4 * h(4)) + h(5) * 6) * 3.5 * k - age * 1.2 * k
  if (y < 0) return null
  return { x, y, angle: age * (6 + 6 * h(6)) }
}

/** The curling streaks of a gust, rushing right to left across the band, each with a little spiral at its head. */
function windLines(buf: Float32Array, cols: number, rows: number, gust: Gust) {
  const k = K(rows)
  const dur = GUSTS[gust.index].dur
  for (let i = 0; i < 9; i++) {
    const h = (n: number) => hash(i * 7.7 + n + gust.index * 5, n + 0.3)
    const speed = (75 + 45 * h(1)) * k
    const age = gust.clock - h(2) * dur * 0.5
    const len = (16 + 14 * h(3)) * k
    const head = cols + 14 * k - age * speed
    if (age < 0 || head < -len - 6 * k) continue
    const y0 = rows * (0.12 + 0.55 * h(4))
    const fade = Math.min(1, age / 0.3)
    // The line: a gentle wave streaming back from the head.
    for (let d = 0; d <= len; d += 0.5) {
      const dash = Math.floor(d * 0.5) % 5 === 4
      if (dash) continue
      plot(buf, cols, rows, head + d, y0 + Math.sin(d * 0.22 + i) * 1.1 * k, (0.95 - 0.5 * (d / len)) * fade)
    }
    // The curl at its head: a circle drawn up and round from where the line ends.
    const r = (1.2 + 0.8 * h(5)) * k
    for (let a = 0; a <= Math.PI * 1.6; a += 0.18) {
      plot(buf, cols, rows, head - Math.sin(a) * r * (1 - a * 0.12), y0 - r + Math.cos(a) * r * (1 - a * 0.12), 0.95 * fade)
    }
  }
}

/** One frame: faint sky, then the slope, then breeze and wind, then the hikers. Values are 0..1 per cell. */
export function compose(cols: number, rows: number, t: number, ground?: Float32Array): Float32Array {
  const buf = new Float32Array(cols * rows)
  clouds(buf, cols, rows, t)
  const base = ground ?? groundField(cols, rows)
  for (let i = 0; i < buf.length; i++) if (base[i] > buf[i]) buf[i] = base[i]
  breeze(buf, cols, rows, t)
  const gust = gustAt(t, cols, rows)
  if (gust && gust.strength > 0.02) windLines(buf, cols, rows, gust)
  for (const h of hikersAt(t, cols, rows)) hiker(buf, cols, rows, h)
  for (let j = 0; j < burstCount(cols); j++) {
    const l = burstLeafAt(j, t, cols, rows)
    if (l) leafShape(buf, cols, rows, l.x, l.y, l.angle, 2.8 * K(rows), 0.95)
  }
  return buf
}
