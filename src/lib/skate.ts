/**
 * A freestyle skateboard session, as a density field in grid cells.
 * A skater rolls in from the left and links tricks on a loop: a shove-it over a row of cones, an
 * ollie up onto a rail, a grind along it with sparks flying off the trucks, a kickflip off the
 * end, a ride up a kicker and out over a pit in a big air with an indy grab and a full 360 spin,
 * a manual on the back wheels, and a happy hop with both arms up as the skater rolls out. Speed lines trail behind, ghost images follow the
 * big tricks, and dust kicks up on each landing.
 * Everything is pure. The canvas only compares density with a Bayer threshold.
 */

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
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

/** The row the ground sits on. */
export const groundRow = (rows: number) => rows - 4 * K(rows)

/** Where the wheels rest on a surface `elev` cells above the ground. */
const surfaceY = (rows: number, elev: number) => groundRow(rows) - 1 - elev

export interface Block {
  x: number
  w: number
  /** Height above the ground. */
  h: number
}

/** The course: cones to hop, a ledge to grind, a kicker to launch off, and a pit to clear. */
export function blocks(cols: number, rows: number): { cones: Block; rail: Block; kicker: Block; pit: Block } {
  const k = K(rows)
  const kicker = { x: cols * 0.62, w: 16 * k, h: 7 * k }
  return {
    cones: { x: cols * 0.13, w: 8.2 * k, h: 3 * k },
    rail: { x: cols * 0.36, w: 22 * k, h: 4 * k },
    kicker,
    // The pit starts a little past the kicker's lip. Its height is its depth.
    pit: { x: kicker.x + kicker.w + 3 * k, w: 16 * k, h: 0 },
  }
}

// Body and board proportions, for a 48 row band.
const LIMB1 = 4.2
const LIMB2 = 4.2
const TORSO = 5
const NECK = 0.6
const HEAD_R = 1.7
const ARM1 = 3
const ARM2 = 3
const WHEEL_R = 1.1
/** Wheel centres sit this far ahead of and behind the middle of the deck, and below it. */
const TRUCK_X = 4
const TRUCK_Y = 1.6

type Pt = [number, number]
type Kind = 'ride' | 'shuvit' | 'ollie' | 'grind' | 'kickflip' | 'ramp' | 'air' | 'manual' | 'cheer'

/** The slope of the kicker. */
const slope = (b: Block) => Math.atan2(b.h, b.w)

interface Beat {
  kind: Kind
  t0: number
  dur: number
  x0: number
  x1: number
  /** Heights of the surfaces taken off from and landed on. */
  e0: number
  e1: number
  /** Extra height of the jump above a straight line between the two. */
  h: number
}

/** Quiet time with the skater out of frame before the loop starts over. */
const PAUSE = 0.5

/** The whole session as a chain of beats. */
export function beats(cols: number, rows: number): { list: Beat[]; cycle: number } {
  const k = K(rows)
  const { cones, rail, kicker } = blocks(cols, rows)
  const plan: [Kind, number, number, number, number][] = [
    // kind, seconds, x at the end, surface at the end, jump height
    ['ride', 0.9, cones.x - 9 * k, 0, 0],
    ['shuvit', 1, cones.x + cones.w + 8 * k, 0, 6 * k],
    ['ride', 0.8, rail.x - 12 * k, 0, 0],
    ['ollie', 0.9, rail.x + 5 * k, rail.h, 5 * k],
    ['grind', 1, rail.x + rail.w - 5 * k, rail.h, 0],
    ['kickflip', 1, rail.x + rail.w + 12 * k, 0, 6 * k],
    ['ride', 0.9, kicker.x - 6 * k, 0, 0],
    ['ramp', 0.5, kicker.x + kicker.w, kicker.h, 0],
    ['air', 1.5, kicker.x + kicker.w + 28 * k, 0, 16 * k],
    ['manual', 1, kicker.x + kicker.w + 42 * k, 0, 0],
    ['cheer', 1.3, cols + 14 * k, 0, 2 * k],
  ]
  const list: Beat[] = []
  let t = 0
  let x = -10 * k
  let e = 0
  for (const [kind, dur, x1, e1, h] of plan) {
    list.push({ kind, t0: t, dur, x0: x, x1, e0: e, e1, h })
    t += dur
    x = x1
    e = e1
  }
  return { list, cycle: t + PAUSE }
}

/** Seconds in one lap. */
export const CYCLE = beats(100, 48).cycle

export interface Figure {
  kind: Kind
  /** Middle of the deck: x, and y in grid rows. */
  x: number
  y: number
  /** Nose up, radians. */
  pitch: number
  /** Turn of the board about its long axis, radians. */
  flip: number
  /** Turn of the board about its vertical axis, radians: a shove-it. */
  shuv: number
  /** Turn of the skater's body, radians. */
  spin: number
  /** Hip offset from the deck's middle: forward, and how high above it, in 48 row units. */
  hipDx: number
  hipH: number
  lean: number
  /** Hands, relative to the shoulders, in 48 row units. Near hand first. */
  hands: [Pt, Pt]
  /** How far the feet are lifted off the deck, in 48 row units. */
  lift: number
  /** 0..1: the near hand reaches for the board. */
  grab: number
  p: number
  air: boolean
  grinding: boolean
}

/** Where a board of this pitch and flip comes to rest on a surface: the deck's middle row. */
function restY(rows: number, elev: number, pitch: number, flip: number): number {
  const s = K(rows)
  const c = Math.cos(pitch)
  const sn = Math.sin(pitch)
  const drop = Math.max(
    ...[-TRUCK_X, TRUCK_X].map((lx) => -lx * s * sn + TRUCK_Y * s * Math.cos(flip) * c),
  )
  return surfaceY(rows, elev) - WHEEL_R * s - drop
}

/** Two-bone limb from a root toward a target: the joint in between, bent whichever way scores higher. */
function bend(root: Pt, target: Pt, l1: number, l2: number, score: (p: Pt) => number): Pt {
  const dx = target[0] - root[0]
  const dy = target[1] - root[1]
  const len = Math.hypot(dx, dy) || 1e-6
  const d = Math.min(len, (l1 + l2) * 0.999)
  const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d)
  const h = Math.sqrt(Math.max(0, l1 * l1 - a * a))
  const ux = dx / len
  const uy = dy / len
  const mx = root[0] + ux * a
  const my = root[1] + uy * a
  const one: Pt = [mx - uy * h, my + ux * h]
  const two: Pt = [mx + uy * h, my - ux * h]
  return score(one) >= score(two) ? one : two
}

const FORWARD = (p: Pt) => p[0]
const DOWNWARD = (p: Pt) => p[1] + 0.3 * p[0]

export interface Rig {
  deck: Pt[]
  wheels: Pt[]
  hip: Pt
  shoulder: Pt
  head: Pt
  knees: Pt[]
  feet: Pt[]
  elbows: Pt[]
  hands: Pt[]
}

/** Every point of the skater and the board, in grid cells. */
export function rigOf(fig: Figure, rows: number): Rig {
  const s = K(rows)
  const c = Math.cos(fig.pitch)
  const sn = Math.sin(fig.pitch)
  const fc = Math.cos(fig.flip)
  // A point in the board's own frame (x forward, y down), turned by its pitch.
  const onBoard = (lx: number, ly: number): Pt => [fig.x + lx * s * c + ly * s * sn, fig.y - lx * s * sn + ly * s * c]
  // A shove-it turns the board about a vertical axis: its length foreshortens.
  const sh = Math.cos(fig.shuv)
  const deck = [onBoard(-6 * sh, -1.3 * fc), onBoard(-5 * sh, 0), onBoard(5 * sh, 0), onBoard(6 * sh, -1.3 * fc)]
  const wheels = [onBoard(-TRUCK_X * sh, TRUCK_Y * fc), onBoard(TRUCK_X * sh, TRUCK_Y * fc)]

  // The body turns about its own spine: its width squashes as it comes round.
  const cx = Math.cos(fig.spin)
  const hip: Pt = [fig.x + fig.hipDx * s, fig.y - fig.hipH * s]
  const up: Pt = [Math.sin(fig.lean), -Math.cos(fig.lean)]
  const shoulder: Pt = [hip[0] + up[0] * TORSO * s * cx, hip[1] + up[1] * TORSO * s]
  const head: Pt = [hip[0] + up[0] * (TORSO + NECK + HEAD_R) * s * cx, hip[1] + up[1] * (TORSO + NECK + HEAD_R) * s]

  const feet = [onBoard(-3, -0.7 - fig.lift), onBoard(3.2, -0.7 - fig.lift)]
  const knees = feet.map((f) => bend(hip, f, LIMB1 * s, LIMB2 * s, FORWARD))

  const grab = onBoard(0, 0.5)
  const farCx = Math.cos(fig.spin + 0.6)
  const targets: Pt[] = fig.hands.map(([hx, hy], i) => [shoulder[0] + hx * s * (i === 0 ? cx : farCx), shoulder[1] + hy * s])
  targets[0] = [lerp(targets[0][0], grab[0], fig.grab), lerp(targets[0][1], grab[1], fig.grab)]
  const elbows = targets.map((t) => bend(shoulder, t, ARM1 * s, ARM2 * s, DOWNWARD))
  const hands = targets.map((t, i) => {
    const e = elbows[i]
    const dx = t[0] - e[0]
    const dy = t[1] - e[1]
    const d = Math.hypot(dx, dy) || 1
    // The hand is a forearm's length from the elbow, toward the target.
    return [e[0] + (dx / d) * ARM2 * s, e[1] + (dy / d) * ARM2 * s] as Pt
  })
  return { deck, wheels, hip, shoulder, head, knees, feet, elbows, hands }
}

const RIDE_HANDS: [Pt, Pt] = [
  [4.5, 1.5],
  [-3.5, 2],
]
const WIDE_HANDS: [Pt, Pt] = [
  [5.5, -0.5],
  [-5, -0.5],
]

/** The skater at time t, or null while out of frame between laps. */
export function figureAt(t: number, cols: number, rows: number): Figure | null {
  const { list, cycle } = beats(cols, rows)
  const tc = ((t % cycle) + cycle) % cycle
  const b = list.find((it) => tc >= it.t0 && tc < it.t0 + it.dur)
  if (!b) return null
  const { kicker } = blocks(cols, rows)
  const p = (tc - b.t0) / b.dur
  const bob = Math.sin(tc * 9)
  const env = Math.sin(Math.PI * p)
  const fig: Figure = {
    kind: b.kind,
    x: lerp(b.x0, b.x1, p),
    y: 0,
    pitch: 0,
    flip: 0,
    shuv: 0,
    spin: 0,
    hipDx: 0,
    hipH: 6.4 + 0.3 * bob,
    lean: 0.25,
    hands: RIDE_HANDS,
    lift: 0,
    grab: 0,
    p,
    air: false,
    grinding: false,
  }
  const elev = lerp(b.e0, b.e1, p)

  switch (b.kind) {
    case 'ride':
      break
    case 'shuvit': {
      // A pop and a half-turn of the board under the feet, which stay still, over the cones.
      fig.pitch = 0.4 * Math.sin(Math.PI * clamp01(p / 0.35)) - 0.1 * Math.sin(Math.PI * clamp01((p - 0.35) / 0.55))
      fig.shuv = Math.PI * smooth(0.2, 0.8, p)
      fig.hipH = lerp(6.4, 5.4, env)
      fig.lift = 1.4 * env
      fig.lean = 0.12
      fig.hands = [
        [3.5, -1.5],
        [-3.5, -1],
      ]
      fig.air = true
      break
    }
    case 'ollie': {
      // The tail pops, the nose lifts, the board levels out over the rail, and lands flat on it.
      fig.pitch = 0.55 * Math.sin(Math.PI * clamp01(p / 0.4)) - 0.2 * Math.sin(Math.PI * clamp01((p - 0.4) / 0.5))
      fig.hipH = lerp(6.4, 5.2, env)
      fig.lift = 0.6 * env
      fig.lean = 0.1
      fig.hands = [
        [3, -3],
        [-2.5, -2.5],
      ]
      fig.air = true
      break
    }
    case 'grind':
      fig.pitch = 0.06
      fig.hipH = 5.8
      fig.lean = 0.15
      fig.hands = WIDE_HANDS
      fig.grinding = true
      break
    case 'kickflip': {
      fig.flip = Math.PI * 2 * smooth(0.2, 0.8, p)
      fig.hipH = lerp(6.4, 5.4, env)
      fig.lift = 3.2 * env
      fig.lean = 0.1
      fig.hands = [
        [3, -3],
        [-3, -2.5],
      ]
      fig.air = true
      break
    }
    case 'ramp':
      fig.pitch = slope(kicker) * smooth(0, 0.2, p)
      fig.hipH = 5.8
      fig.lean = 0.35
      break
    case 'air': {
      // A big air: knees tucked, a full spin, and the near hand on the board.
      const e = smooth(0, 0.2, p) * (1 - smooth(0.8, 1, p))
      fig.pitch = 0.3 * env
      fig.spin = Math.PI * 2 * smooth(0.15, 0.85, p)
      fig.hipH = lerp(6.4, 4.4, e)
      fig.lift = 1.2 * e
      fig.lean = 0.1
      fig.hands = [
        [5.5, -1],
        [-5.5, -1.5],
      ]
      fig.grab = smooth(0.3, 0.45, p) * (1 - smooth(0.7, 0.85, p))
      fig.air = true
      break
    }
    case 'manual':
      // Back wheels only, arms out for balance.
      fig.pitch = 0.38 * smooth(0, 0.15, p) * (1 - smooth(0.85, 1, p))
      fig.hipDx = -1.2 * Math.sin(fig.pitch / 0.38 || 0)
      fig.hipH = 6.6
      fig.lean = -0.1
      fig.hands = WIDE_HANDS
      break
    case 'cheer': {
      // A happy little hop, both arms up and pumping.
      const wave = Math.sin(tc * 14)
      fig.hipH = 6.5
      fig.lean = -0.1
      fig.hands = [
        [2, -6.5 + wave],
        [-1.2, -6.2 - wave],
      ]
      fig.air = true
      break
    }
  }

  if (b.kind === 'ramp') {
    fig.y = restY(rows, elev, fig.pitch, 0)
  } else {
    // On the ground the board rests on its wheels; in the air it follows a hop between the surfaces.
    const rest0 = restY(rows, b.e0, 0, 0)
    const rest1 = restY(rows, b.e1, 0, 0)
    if (b.kind === 'ride' || b.kind === 'grind' || b.kind === 'manual') {
      fig.y = restY(rows, elev, fig.pitch, 0)
    } else {
      fig.y = lerp(rest0, rest1, p) - b.h * 4 * p * (1 - p)
    }
  }
  return fig
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

/** The skater and the board: far limbs a little dimmer than the near ones. */
function skater(buf: Float32Array, cols: number, rows: number, fig: Figure, v: number) {
  const s = K(rows)
  const r = rigOf(fig, rows)
  const line = (a: Pt, b: Pt, w: number, val: number) => stroke(buf, cols, rows, a, b, w * s, val)
  // Board: the deck with its kicked ends, then the wheels.
  for (let i = 0; i < 3; i++) line(r.deck[i], r.deck[i + 1], 0.9, v)
  for (const w of r.wheels) stroke(buf, cols, rows, w, w, 2 * WHEEL_R * s, v)
  for (const i of [1, 0]) {
    const val = v * (i === 1 ? 0.6 : 0.95)
    line(r.hip, r.knees[i], 1.5, val)
    line(r.knees[i], r.feet[i], 1.4, val)
    line(r.shoulder, r.elbows[i], 1.3, val)
    line(r.elbows[i], r.hands[i], 1.2, val)
  }
  line(r.hip, r.shoulder, 2.6, v)
  stroke(buf, cols, rows, r.head, r.head, 2 * HEAD_R * s, v)
}

/** Short dashes streaming back from the skater, flickering as they go. */
function speedLines(buf: Float32Array, cols: number, rows: number, fig: Figure, tc: number) {
  const s = K(rows)
  const tick = Math.floor(tc * 14)
  for (let i = 0; i < 5; i++) {
    const h = (n: number) => hash(i * 3.3 + n, tick * 0.7 + n)
    const len = (5 + 9 * h(1)) * s
    const y = fig.y - 7 * s + i * 2.6 * s
    const head = fig.x - (8 + 3 * h(2)) * s
    for (let x = head - len; x <= head; x += 0.5) plot(buf, cols, rows, x, y, 0.2 + 0.4 * ((x - head + len) / len))
  }
}

/** Sparks flying back off the trucks while the board grinds. */
function sparks(buf: Float32Array, cols: number, rows: number, fig: Figure, tc: number) {
  const s = K(rows)
  const tick = Math.floor(tc * 20)
  const wheel = rigOf(fig, rows).wheels[0]
  for (let i = 0; i < 10; i++) {
    const h = (n: number) => hash(i * 1.9 + n, tick + n * 0.6)
    const x = wheel[0] - (1 + h(1) * 8) * s
    const y = wheel[1] + WHEEL_R * s - h(2) * 4 * s * h(1)
    plot(buf, cols, rows, x, y, 0.95)
    if (h(3) > 0.5) plot(buf, cols, rows, x - 1, y + 1, 0.6)
  }
}

/** Dust thrown up where the board lands, drifting out and settling. */
function dust(buf: Float32Array, cols: number, rows: number, tc: number, list: Beat[]) {
  const s = K(rows)
  for (const b of list) {
    if (b.h === 0 || b.kind === 'cheer') continue
    const age = tc - (b.t0 + b.dur)
    if (age < 0 || age > 0.55) continue
    const fade = 1 - age / 0.55
    for (let i = 0; i < 9; i++) {
      const h = (n: number) => hash(b.t0 * 3.1 + i * 1.7 + n, n + 2.2)
      const side = i % 2 === 0 ? -1 : 1
      const x = b.x1 + side * (1 + h(1) * 5 + age * (10 + 10 * h(2))) * s
      const y = surfaceY(rows, b.e1) + 0.5 - (age * (7 + 5 * h(3)) - age * age * 14) * s
      plot(buf, cols, rows, x, y, 0.7 * fade)
      plot(buf, cols, rows, x + 1, y, 0.5 * fade)
    }
  }
}

/** The ground and the course: a line, small ticks of grit, the ledge, and the kicker. */
export function groundField(cols: number, rows: number): Float32Array {
  const buf = new Float32Array(cols * rows)
  const g = groundRow(rows)
  const { cones, rail, kicker, pit } = blocks(cols, rows)
  const inPit = (c: number) => c > Math.round(pit.x) && c < Math.round(pit.x + pit.w)
  for (let c = 0; c < cols; c++) {
    if (inPit(c)) continue
    plot(buf, cols, rows, c, g + Math.sin(c * 0.07) * 0.4, 0.45)
    if (hash(c * 1.9, 4.1) < 0.1) plot(buf, cols, rows, c, g + 1 + hash(c, 8.8) * 2, 0.35)
  }
  // The pit: sheer sides and a dark floor.
  for (const x of [Math.round(pit.x), Math.round(pit.x + pit.w)]) {
    for (let y = Math.round(g); y < rows; y++) plot(buf, cols, rows, x, y, 0.9)
  }
  for (let x = Math.round(pit.x) + 1; x < Math.round(pit.x + pit.w); x++) {
    for (let y = Math.round(g) + 1; y < rows; y++) plot(buf, cols, rows, x, y, 0.3 + 0.2 * ((y - g) / (rows - g)))
  }
  // Cones: three little triangles in a row, each with a pale stripe.
  const k = K(rows)
  for (let i = 0; i < 3; i++) {
    const cx = cones.x + (1.1 + i * 3.0) * k
    for (let y = 0; y <= Math.round(cones.h); y++) {
      const half = (1.1 * k * y) / cones.h
      for (let x = Math.round(cx - half); x <= Math.round(cx + half); x++) {
        plot(buf, cols, rows, x, g - cones.h + y, y === Math.round(cones.h * 0.55) ? 0.3 : 0.85)
      }
    }
  }
  // The ledge: a filled box with a bright edge.
  const rx0 = Math.round(rail.x)
  const rx1 = Math.round(rail.x + rail.w)
  for (let x = rx0; x <= rx1; x++) {
    for (let y = Math.round(g - rail.h); y <= Math.round(g); y++) {
      const edge = x === rx0 || x === rx1 || y === Math.round(g - rail.h)
      plot(buf, cols, rows, x, y, edge ? 0.9 : 0.2)
    }
  }
  // The kicker: a wedge rising to the right, sheer at its lip.
  const kx0 = Math.round(kicker.x)
  const kx1 = Math.round(kicker.x + kicker.w)
  for (let x = kx0; x <= kx1; x++) {
    const top = g - kicker.h * ((x - kicker.x) / kicker.w)
    for (let y = Math.round(top); y <= Math.round(g); y++) {
      plot(buf, cols, rows, x, y, y === Math.round(top) || x === kx1 ? 0.9 : 0.2)
    }
  }
  return buf
}

/** One frame: the course, speed lines, dust, sparks, the ghosts of a big trick, then the skater. Values are 0..1 per cell. */
export function compose(cols: number, rows: number, t: number, ground?: Float32Array): Float32Array {
  const buf = ground ? Float32Array.from(ground) : groundField(cols, rows)
  const { list, cycle } = beats(cols, rows)
  const tc = ((t % cycle) + cycle) % cycle
  dust(buf, cols, rows, tc, list)
  const fig = figureAt(t, cols, rows)
  if (!fig) return buf
  if (fig.grinding) sparks(buf, cols, rows, fig, tc)
  else speedLines(buf, cols, rows, fig, tc)
  if (fig.kind === 'air' || fig.kind === 'kickflip') {
    // Afterimages: sparse copies a moment behind, so a big trick leaves a trail.
    ;[0.16, 0.08].forEach((dt, i) => {
      const ghost = figureAt(t - dt, cols, rows)
      if (ghost) skater(buf, cols, rows, ghost, 0.18 + 0.12 * (1 - i))
    })
  }
  skater(buf, cols, rows, fig, 1)
  return buf
}
