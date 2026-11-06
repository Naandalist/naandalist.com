/**
 * An afternoon of fishing on a rolling sea, as a density field in grid cells.
 * The water sloshes in long, heavy swells. A small fishing boat stays moored at the right edge,
 * riding up and down, and a man in a hat fishes off its side. Small fish nibble now and then, and
 * once a cycle he lands a big one: a tug of war, the fish yanked out and flung spinning high into
 * the sky, reeled in, held up, dropped in the crate, and the float cast back out. Flocks of gulls keep crossing the sky.
 * Everything is pure. The canvas only compares density with a Bayer threshold.
 */

const frac = (v: number) => v - Math.floor(v)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** Scale reference: every size below is drawn for a 48 row band and scaled by this. */
const K = (rows: number) => rows / 48

/**
 * The swell, sloshing like a rocked tank. `period` is one full swing in seconds. `tilt` (one end up
 * while the other goes down) and `hump` (a crest in the middle) are in rows at 48. `base` is where
 * the water rests, as a fraction of the band.
 */
export const SLOSH = { period: 9, tilt: 7, hump: 2.5, humpRatio: 1.83, ripple: 0.35, base: 0.66 } as const

const OMEGA = (2 * Math.PI) / SLOSH.period

/** The swing eases off and back in, so no two are quite the same. */
const swing = (t: number) => 0.8 + 0.2 * Math.sin(t * 0.23)

/** The row of the water surface at column x and time t. */
export function interfaceAt(x: number, t: number, cols: number, rows: number): number {
  const k = K(rows)
  const u = x / Math.max(1, cols)
  return (
    rows * SLOSH.base +
    SLOSH.tilt * k * Math.cos(Math.PI * u) * Math.sin(OMEGA * t) * swing(t) +
    SLOSH.hump * k * Math.cos(2 * Math.PI * u) * Math.sin(OMEGA * SLOSH.humpRatio * t + 1) +
    SLOSH.ripple * k * Math.sin(x * 0.12 - t * 1.1)
  )
}

/** The boat's outline in local units at 48 rows: stern and bow at the deck, keel depth, deck height. */
export const HULL = { left: 10, right: 10.5, keel: 2.5, deck: 2 } as const

/** Gap between the boat and the right edge, in local units. */
const MOORING = 3

/** The boat, the fisherman, and his rod are drawn this much larger than the 48 row reference. */
export const BOAT_SCALE = 1.4

const KB = (rows: number) => K(rows) * BOAT_SCALE

export interface Boat {
  x: number
  /** Waterline of the hull, on the surface. */
  y: number
  /** How far the left end is pitched up, in radians. */
  tilt: number
}

/** The boat never leaves its spot at the right edge. It only rises, falls, and rocks a little. */
export function boatAt(cols: number, rows: number, t: number): Boat {
  const k = KB(rows)
  const x = cols - (HULL.right + MOORING) * k
  const y = interfaceAt(x, t, cols, rows)
  const reach = 8 * k
  const slope = (interfaceAt(x + reach, t, cols, rows) - interfaceAt(x - reach, t, cols, rows)) / (2 * reach)
  return { x, y, tilt: -Math.atan(slope) * 0.7 }
}

/** A local point on the boat (u: toward the right end, v: up, in 48 row units) in grid cells. */
function onBoat(b: Boat, k: number, u: number, v: number): [number, number] {
  const cos = Math.cos(b.tilt)
  const sin = Math.sin(b.tilt)
  return [b.x + (u * cos - v * sin) * k, b.y - (u * sin + v * cos) * k]
}

/** How often a fish bites, in seconds, and how long the tug lasts as a fraction of that. */
export const BITE = { every: 14, lasts: 0.14 } as const

/**
 * The big catch, once per `every` seconds, starting `start` seconds in. Then, in seconds: the
 * tug of war, the fish yanked out and flung high into the sky, the reel in to his hand, holding
 * it up and dropping it in the crate, and the recast that sends the float back out.
 */
export const CATCH = { every: 38, start: 24, fight: 5, fly: 2.5, reel: 2, hold: 2, recast: 2.5 } as const

/** How many times the fish and the fisherman pull against each other during the fight. */
export const TUGS = 3

export type Stage = 'wait' | 'fight' | 'fly' | 'reel' | 'hold' | 'recast'
const STAGES = ['fight', 'fly', 'reel', 'hold', 'recast'] as const

/** Which part of the catch is playing at time t, and how far into it (0..1). */
export function stageAt(t: number): { stage: Stage; p: number } {
  let s = frac(t / CATCH.every) * CATCH.every - CATCH.start
  if (s < 0) return { stage: 'wait', p: 0 }
  for (const name of STAGES) {
    if (s < CATCH[name]) return { stage: name, p: s / CATCH[name] }
    s -= CATCH[name]
  }
  return { stage: 'wait', p: 0 }
}

/** How hard a small fish is nibbling right now, 0 (nothing) to 1. Quiet while the big catch plays. */
export function biteAt(t: number): number {
  if (stageAt(t).stage !== 'wait') return 0
  const p = frac(t / BITE.every)
  const start = 1 - BITE.lasts
  return p < start ? 0 : Math.sin(((p - start) / BITE.lasts) * Math.PI)
}

/** Rod butt, hand, and tip in local boat units, and where the tip goes when he lifts the rod. */
const ROD = { butt: [-4.4, 4.6], hand: [-6.6, 6.1], tip: [-19, 11.5], lifted: [-12, 13.5] } as const

/** Where he holds the fish up, and the crate it goes into, in local boat units. */
const HELD = [-11.5, 8.4] as const
const CRATE = { left: -0.6, right: 2.4, top: 4.2 } as const

/** The fish, in local boat units at 48 rows: length and height. */
export const FISH = { length: 8.5, height: 3.2 } as const

const ease = (p: number) => p * p * (3 - 2 * p)

export interface Fish {
  x: number
  y: number
  /** Direction the head points, in radians, screen axes (y down). */
  angle: number
  /** Below the surface, drawn fainter. */
  under: boolean
  /** Tail swing, -1..1. */
  wag: number
}

export interface Fishing {
  stage: Stage
  /** The rod tip in local boat units, and in grid cells. */
  tipU: number
  tipV: number
  tipX: number
  tipY: number
  /** How far the rod bows under load, 0..1. */
  pull: number
  /** How far he leans back to haul on the rod, 0..1. */
  lean: number
  /** Where the line ends: the float, or the fish's mouth while it is hooked. */
  lineX: number
  lineY: number
  floatX: number
  floatY: number
  fish: Fish | null
  /** Where his free hand reaches, when it reaches for the fish. */
  reach: [number, number] | null
  splash: Splash | null
}

export interface Splash {
  x: number
  y: number
  /** Progress through the splash, 0..1. */
  p: number
  /** 1 for a float landing, larger for a fish thrashing or bursting out. */
  size: number
}

/** Everything about the fishing at time t: rod, line, float, the fish, and any splash. */
export function fishingAt(cols: number, rows: number, t: number): Fishing {
  const k = KB(rows)
  const b = boatAt(cols, rows, t)
  const { stage, p } = stageAt(t)
  const e = ease(p)
  const L = FISH.length * k

  // The tug of war: positive while the fish pulls, negative while he hauls back, harder each time.
  const tug = stage === 'fight' ? Math.sin(p * Math.PI * 2 * TUGS) * (0.6 + 0.4 * p) : 0
  // At the very end of the fight he yanks the rod up, and it stays up until the recast.
  const yank = stage === 'fight' ? ease(Math.max(0, (p - 0.9) / 0.1)) : 0
  const lift =
    stage === 'fight'
      ? Math.max(0.35 * Math.max(0, -tug), yank)
      : stage === 'recast'
        ? 1 - e
        : stage === 'wait'
          ? 0
          : 1
  const bite = biteAt(t)
  const dip =
    stage === 'fight'
      ? (2 + 2.5 * Math.max(0, tug) + Math.sin(t * 13) * 0.6) * (1 - yank)
      : stage === 'wait'
        ? 2.5 * bite
        : 0
  const pull =
    stage === 'fight' ? (0.6 + 0.4 * Math.abs(tug)) * (1 - yank * 0.5) : stage === 'fly' ? 0.5 * (1 - e) : stage === 'wait' ? bite : 0
  const lean = stage === 'fight' ? Math.max(0.25, Math.max(0, -tug), yank) : stage === 'fly' ? 1 - e : 0
  const tipU = lerp(ROD.tip[0], ROD.lifted[0], lift)
  const tipV = lerp(ROD.tip[1], ROD.lifted[1], lift) - dip
  const [tipX, tipY] = onBoat(b, k, tipU, tipV)

  // Where the float rests when nothing is happening.
  const [restTipX] = onBoat(b, k, ROD.tip[0], ROD.tip[1])
  const restX = restTipX - 1.5 * k
  const water = (x: number) => interfaceAt(x, t, cols, rows)
  const restY = water(restX) - 0.6

  const base = { stage, tipU, tipV, tipX, tipY, pull, lean, fish: null, reach: null, splash: null }
  const head = (f: Fish): [number, number] => [f.x + Math.cos(f.angle) * L * 0.5, f.y + Math.sin(f.angle) * L * 0.5]
  // He grips it just ahead of the tail.
  const grip = (f: Fish): [number, number] => [f.x - Math.cos(f.angle) * L * 0.4, f.y - Math.sin(f.angle) * L * 0.4]
  const hooked = (f: Fish, reach: [number, number] | null = null): Fishing => {
    const [mx, my] = head(f)
    return { ...base, fish: f, reach, lineX: mx, lineY: my, floatX: lerp(tipX, mx, 0.55), floatY: lerp(tipY, my, 0.55) }
  }
  // The fish hanging straight down from the rod tip, mouth on the hook.
  const hang = (): [number, number] => [tipX, tipY + 1.5 * k + L * 0.5]
  const [heldX, heldY] = onBoat(b, k, HELD[0], HELD[1])

  // Where the fish is under the water during the fight: dragged out when it pulls, hauled in when he does.
  const fightAt = (q: number, tt: number): Fish => {
    const g = Math.sin(q * Math.PI * 2 * TUGS) * (0.6 + 0.4 * q)
    const x = restX - 4 * k - g * 5 * k + Math.sin(tt * 6) * 0.8 * k
    // Twice it breaks the surface, thrashing, when he hauls hardest.
    const breach = Math.max(0, -Math.sin(q * Math.PI * 2 * TUGS)) ** 6 * (q > 0.2 ? 1 : 0)
    const y = water(x) + lerp(3 * k, -0.5 * k, breach)
    const facing = g > 0 ? Math.PI : 0
    return { x, y, angle: facing + Math.sin(tt * 9) * (0.3 + breach * 0.5), under: breach < 0.5, wag: Math.sin(tt * (16 + breach * 8)) }
  }

  if (stage === 'fight') {
    const fish = fightAt(p, t)
    const [mx, my] = head(fish)
    const thrash = fish.under ? 1.2 : 2.2
    return {
      ...hooked(fish),
      floatX: lerp(mx, tipX, 0.2),
      floatY: Math.max(water(lerp(mx, tipX, 0.2)) + 0.5, lerp(my, tipY, 0.2)),
      lineX: mx,
      lineY: my,
      splash: { x: fish.x, y: water(fish.x), p: frac(t * 1.7), size: thrash },
    }
  }
  if (stage === 'fly') {
    // Flung from where the fight ended, high into the sky, spinning, and down onto the line.
    const fromFish = fightAt(1, t - p * CATCH.fly)
    const from: [number, number] = [fromFish.x, water(fromFish.x)]
    const to = hang()
    const apex: [number, number] = [lerp(from[0], to[0], 0.4), 1.5 + 2 * K(rows)]
    // A quadratic curve through the apex at its middle.
    const ctrl: [number, number] = [2 * apex[0] - (from[0] + to[0]) / 2, 2 * apex[1] - (from[1] + to[1]) / 2]
    const at = (q: number): [number, number] => [
      (1 - q) ** 2 * from[0] + 2 * (1 - q) * q * ctrl[0] + q * q * to[0],
      (1 - q) ** 2 * from[1] + 2 * (1 - q) * q * ctrl[1] + q * q * to[1],
    ]
    const [x, y] = at(e)
    // Two full spins on the way, settling mouth up as it lands on the line.
    const angle = lerp(-Math.PI / 2 - 4 * Math.PI, -Math.PI / 2, ease(Math.min(1, p * 1.1)))
    const fish: Fish = { x, y, angle, under: false, wag: Math.sin(t * 22) }
    return { ...hooked(fish), splash: p < 0.6 ? { x: from[0], y: from[1], p: p / 0.6, size: 3.2 } : null }
  }
  if (stage === 'reel') {
    const [hx, hy] = hang()
    const fish: Fish = { x: lerp(hx, heldX, e), y: lerp(hy, heldY, e), angle: lerp(-Math.PI / 2, -Math.PI, e), under: false, wag: Math.sin(t * 14) }
    return hooked(fish, e > 0.6 ? grip(fish) : null)
  }
  if (stage === 'hold') {
    const dangle = { lineX: tipX, lineY: tipY + 4 * k, floatX: tipX, floatY: tipY + 4 * k }
    if (p < 0.6) {
      const fish: Fish = { x: heldX, y: heldY, angle: -Math.PI + Math.sin(t * 14) * 0.15, under: false, wag: Math.sin(t * 20) }
      return { ...base, ...dangle, fish, reach: grip(fish) }
    }
    const q = ease((p - 0.6) / 0.4)
    const [cx, cy] = onBoat(b, k, (CRATE.left + CRATE.right) / 2, CRATE.top - 1.5)
    const fish: Fish = { x: lerp(heldX, cx, q), y: lerp(heldY, cy, q), angle: lerp(-Math.PI, (-3 * Math.PI) / 2, q), under: false, wag: Math.sin(t * 20) }
    return { ...base, ...dangle, fish: q < 0.85 ? fish : null, reach: q < 0.85 ? grip(fish) : null }
  }
  if (stage === 'recast') {
    const fx = lerp(tipX, restX, e)
    const fy = lerp(tipY + 4 * k, restY, e) - Math.sin(e * Math.PI) * 6 * k
    const splash = p > 0.85 ? { x: restX, y: water(restX), p: (p - 0.85) / 0.15, size: 1 } : null
    return { ...base, lineX: fx, lineY: fy, floatX: fx, floatY: fy, splash }
  }
  const floatY = restY + bite * 2 * k
  return { ...base, lineX: restX, lineY: floatY, floatX: restX, floatY }
}

/** The gulls come in flocks: each crosses once per `period` seconds, taking `cross` seconds, then the sky is empty. */
export const FLOCKS = [
  {
    period: 17,
    cross: 9,
    phase: 0.15,
    y: 0.14,
    dir: 1,
    birds: [
      [0, 0, 1],
      [-7, -2.5, 0.85],
      [-8, 2.5, 0.85],
      [-14, -4.5, 0.7],
      [-15, 4, 0.7],
    ],
  },
  {
    period: 23,
    cross: 12,
    phase: 0.6,
    y: 0.24,
    dir: -1,
    birds: [
      [0, 0, 0.9],
      [-8, 2.2, 0.8],
      [-17, -1, 0.75],
      [-23, 2.8, 0.65],
    ],
  },
  {
    period: 29,
    cross: 7,
    phase: 0.35,
    y: 0.11,
    dir: 1,
    birds: [
      [0, 0, 0.75],
      [-6, 1.8, 0.65],
      [-11, -0.8, 0.6],
    ],
  },
] as const

/** How far past the edges a flock starts and ends, so its last bird has left before it vanishes. */
const MARGIN = 30

export interface Gull {
  x: number
  y: number
  /** How far the wings are lifted, from -1 (down) to 1 (up). */
  flap: number
  s: number
}

/** Every gull in the sky at time t. Most of the time there are none. */
export function gullsAt(t: number, cols: number, rows: number): Gull[] {
  const k = K(rows)
  const out: Gull[] = []
  FLOCKS.forEach((f, fi) => {
    const q = (frac(t / f.period + f.phase) * f.period) / f.cross
    if (q > 1) return
    const lead = f.dir > 0 ? lerp(-6 * k, cols + MARGIN * k, q) : lerp(cols + 6 * k, -MARGIN * k, q)
    f.birds.forEach(([dx, dy, s], i) => {
      // Wings beat in bursts, then the bird glides.
      const beat = 0.35 + 0.65 * Math.max(0, Math.sin(t * 0.9 + i * 1.7 + fi))
      out.push({
        x: lead + dx * f.dir * k,
        y: rows * f.y + dy * k + Math.sin(t * 1.6 + i * 2.3 + fi) * 1.2 * k,
        flap: Math.sin(t * 7 + i * 1.3) * beat,
        s,
      })
    })
  })
  return out
}

function plot(buf: Float32Array, cols: number, rows: number, x: number, y: number, v: number) {
  const xi = Math.round(x)
  const yi = Math.round(y)
  if (xi < 0 || xi >= cols || yi < 0 || yi >= rows) return
  const i = yi * cols + xi
  if (v > buf[i]) buf[i] = v
}

/** Like plot, but overwrites: used to cut a clear eye into the fish. */
function put(buf: Float32Array, cols: number, rows: number, x: number, y: number, v: number) {
  const xi = Math.round(x)
  const yi = Math.round(y)
  if (xi < 0 || xi >= cols || yi < 0 || yi >= rows) return
  buf[yi * cols + xi] = v
}

function line(buf: Float32Array, cols: number, rows: number, x0: number, y0: number, x1: number, y1: number, v: number) {
  const steps = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 2))
  for (let n = 0; n <= steps; n++) {
    const u = n / steps
    plot(buf, cols, rows, lerp(x0, x1, u), lerp(y0, y1, u), v)
  }
}

/** The sea: a bright line on the surface, then dyed water that deepens toward the floor. */
function sea(buf: Float32Array, cols: number, rows: number, t: number) {
  for (let c = 0; c < cols; c++) {
    const y = interfaceAt(c, t, cols, rows)
    plot(buf, cols, rows, c, y, 0.95)
    plot(buf, cols, rows, c, y + 1, 0.55)
    const depth = Math.max(1, rows - y)
    for (let r = Math.round(y) + 2; r < rows; r++) plot(buf, cols, rows, c, r, lerp(0.22, 0.4, (r - y) / depth))
  }
}

/** The boat and the fisherman: hull, wheelhouse, a seated man in a hat, his rod, the line, and the float. */
function boat(buf: Float32Array, cols: number, rows: number, t: number) {
  const k = KB(rows)
  const b = boatAt(cols, rows, t)
  const P = (u: number, v: number) => onBoat(b, k, u, v)
  const seg = (u0: number, v0: number, u1: number, v1: number, val: number) => {
    const [x0, y0] = P(u0, v0)
    const [x1, y1] = P(u1, v1)
    line(buf, cols, rows, x0, y0, x1, y1, val)
  }
  // A solid band from v0 to v1 whose ends run from [a0, b0] at v0 to [a1, b1] at v1.
  const step = 0.35 / k
  const slab = (v0: number, v1: number, a0: number, b0: number, a1: number, b1: number, val: number) => {
    for (let v = v0; v <= v1 + 1e-6; v += step) {
      const w = (v - v0) / (v1 - v0)
      const end = lerp(b0, b1, w)
      for (let u = lerp(a0, a1, w); u <= end + 1e-6; u += step) {
        const [x, y] = P(u, v)
        plot(buf, cols, rows, x, y, val)
      }
    }
  }
  const disc = (cu: number, cv: number, r: number, val: number) => {
    for (let v = -r; v <= r + 1e-6; v += step) {
      const half = Math.sqrt(Math.max(0, r * r - v * v))
      for (let u = -half; u <= half + 1e-6; u += step) {
        const [x, y] = P(cu + u, cv + v)
        plot(buf, cols, rows, x, y, val)
      }
    }
  }
  const { left, right, keel, deck } = HULL

  // Hull: a dark wedge, both ends raked, with a bright gunwale.
  slab(-keel, deck, -7, 7.5, -left, right, 0.8)
  seg(-left, deck, right, deck, 0.95)
  seg(-7, -keel, 7.5, -keel, 0.9)
  seg(-7, -keel, -left, deck, 0.9)
  seg(7.5, -keel, right, deck, 0.9)

  // Wheelhouse with a dark window, and a short mast with a pennant.
  slab(deck, 7.5, 3, 8, 3.3, 7.7, 0.14)
  seg(3, deck, 3.3, 7.5, 0.85)
  seg(8, deck, 7.7, 7.5, 0.85)
  seg(2.6, 7.5, 8.4, 7.5, 0.95)
  slab(5, 6.4, 4.1, 7, 4.2, 6.9, 0.75)
  seg(6.2, 7.5, 6.4, 12, 0.6)
  seg(6.4, 12, 8.6 + Math.sin(t * 2.2) * 0.4, 11.6, 0.6)

  // The fisherman, sitting on a box and facing the open water to the left.
  slab(deck, 3.6, -4.2, -1.8, -4.2, -1.8, 0.5)
  // When he hauls on the rod his shoulders and head swing back toward the stern.
  const f = fishingAt(cols, rows, t)
  const lb = f.lean * 1.8
  const ld = f.lean * 0.4
  seg(-3, 3.8, -3.6 + lb, 7.5 - ld, 0.95)
  seg(-2.5, 3.8, -3.1 + lb, 7.4 - ld, 0.9)
  seg(-3, 3.8, -6, 4.6, 0.9)
  seg(-6, 4.6, -6.4, deck, 0.9)
  seg(-3.5 + lb, 7.1 - ld, ROD.hand[0], ROD.hand[1], 0.85)
  disc(-3.9 + lb, 9.1 - ld, 1.1, 0.95)
  seg(-5.7 + lb, 10.1 - ld, -2.1 + lb, 10.1 - ld, 0.95)
  slab(10.1 - ld, 11.2 - ld, -4.8 + lb, -3 + lb, -4.6 + lb, -3.2 + lb, 0.95)

  // The fish crate on deck, between him and the wheelhouse.
  slab(deck, CRATE.top, CRATE.left, CRATE.right, CRATE.left, CRATE.right, 0.35)
  seg(CRATE.left - 0.2, CRATE.top, CRATE.right + 0.2, CRATE.top, 0.9)
  seg(CRATE.left, deck, CRATE.left, CRATE.top, 0.85)
  seg(CRATE.right, deck, CRATE.right, CRATE.top, 0.85)

  // The rod, bowing as the fish pulls, then the line down to the float or the hooked fish.
  const tip: [number, number] = [f.tipU, f.tipV]
  const bend: [number, number] = [lerp(ROD.hand[0], tip[0], 0.5), lerp(ROD.hand[1], tip[1], 0.5) + 1.2 - 1.8 * f.pull]
  const n = 24
  for (let i = 0; i < n; i++) {
    const a = i / n
    const c = (i + 1) / n
    const q = (s: number, i0: number) => (1 - s) ** 2 * ROD.hand[i0] + 2 * (1 - s) * s * bend[i0] + s * s * tip[i0]
    seg(q(a, 0), q(a, 1), q(c, 0), q(c, 1), lerp(0.9, 0.6, a))
  }
  seg(ROD.butt[0], ROD.butt[1], ROD.hand[0], ROD.hand[1], 0.9)
  line(buf, cols, rows, f.tipX, f.tipY, f.lineX, f.lineY, 0.4)
  plot(buf, cols, rows, f.floatX, f.floatY, 1)
  plot(buf, cols, rows, f.floatX, f.floatY - 1, 1)

  // His free arm reaching out to take the fish.
  if (f.reach) {
    const [sx, sy] = P(-3.6 + lb, 7.3 - ld)
    line(buf, cols, rows, sx, sy, f.reach[0], f.reach[1], 0.9)
  }
  if (f.fish) fish(buf, cols, rows, f.fish, k)
  if (f.splash) splash(buf, cols, rows, f.splash)
}

/** The big fish: a plump body, a forked tail that wags, a dorsal fin always on top, and a clear eye. */
function fish(buf: Float32Array, cols: number, rows: number, f: Fish, k: number) {
  const L = FISH.length * k
  const H = FISH.height * k
  const ca = Math.cos(f.angle)
  const sa = Math.sin(f.angle)
  // Keep the back on top whichever way it faces.
  const up = ca <= 0 ? 1 : -1
  // a: along the body toward the head, c: across it.
  const P = (a: number, c: number): [number, number] => [f.x + a * ca - c * up * sa, f.y + a * sa + c * up * ca]
  const val = f.under ? 0.6 : 0.85
  for (let a = -L / 2; a <= L / 2; a += 0.4) {
    const s = (2 * a) / L
    const half = (H / 2) * Math.sqrt(Math.max(0, 1 - s * s)) * (s > 0 ? 1 : 0.8 + 0.2 * (1 + s))
    for (let c = -half; c <= half; c += 0.4) {
      const [x, y] = P(a, c)
      plot(buf, cols, rows, x, y, val)
    }
  }
  const [bx, by] = P(-L / 2, 0)
  for (let w = -1; w <= 1.001; w += 0.25) {
    const [tx, ty] = P(-L / 2 - 0.3 * L, w * H * 0.6 + f.wag * H * 0.35)
    line(buf, cols, rows, bx, by, tx, ty, val)
  }
  // P's c axis points down the screen for a fish facing left, so the back is -H.
  const [d0x, d0y] = P(0.05 * L, -H * 0.45)
  const [d1x, d1y] = P(-0.15 * L, -H * 0.85)
  const [d2x, d2y] = P(-0.28 * L, -H * 0.35)
  line(buf, cols, rows, d0x, d0y, d1x, d1y, val)
  line(buf, cols, rows, d1x, d1y, d2x, d2y, val)
  if (!f.under) {
    const [ex, ey] = P(0.3 * L, -H * 0.12)
    put(buf, cols, rows, ex, ey, 0)
  }
}

/** Droplets thrown up from the surface, rising and falling apart. p runs 0..1 over the splash. */
function splash(buf: Float32Array, cols: number, rows: number, s: Splash) {
  const k = K(rows) * s.size
  const n = 5 + Math.round(s.size * 2)
  for (let i = 0; i < n; i++) {
    const side = i - (n - 1) / 2
    const spread = side / ((n - 1) / 2)
    const x = s.x + side * K(rows) * (0.6 + s.p * 1.6) * Math.sqrt(s.size)
    const y = s.y - 1 - Math.sin(s.p * Math.PI) * (3.5 - Math.abs(spread) * 2.4) * k
    plot(buf, cols, rows, x, y, 0.85 * (1 - s.p * 0.5))
    if (s.size > 2) plot(buf, cols, rows, x + 0.5, y + 1.2 * K(rows), 0.6 * (1 - s.p))
  }
}

/** One gull: a body dot with two long wings that beat above it. */
function gull(buf: Float32Array, cols: number, rows: number, g: Gull) {
  const k = K(rows)
  const span = 3 * k * g.s
  const tipY = g.y - span * g.flap * 0.55 - 0.2 * k
  line(buf, cols, rows, g.x, g.y, g.x - span, tipY, 0.9)
  line(buf, cols, rows, g.x, g.y, g.x + span, tipY, 0.9)
  line(buf, cols, rows, g.x - span, tipY, g.x - span * 1.25, tipY + 0.8 * k, 0.7)
  line(buf, cols, rows, g.x + span, tipY, g.x + span * 1.25, tipY + 0.8 * k, 0.7)
  plot(buf, cols, rows, g.x, g.y, 0.9)
}

/** Every frame is drawn fresh: the ground is empty. */
export function groundField(cols: number, rows: number): Float32Array {
  return new Float32Array(cols * rows)
}

/** One frame: the sea, the boat with the fisherman, then any gulls passing over. Values are 0..1 per cell. */
export function compose(cols: number, rows: number, t: number, ground?: Float32Array): Float32Array {
  const buf = ground ? Float32Array.from(ground) : groundField(cols, rows)
  sea(buf, cols, rows, t)
  boat(buf, cols, rows, t)
  for (const g of gullsAt(t, cols, rows)) gull(buf, cols, rows, g)
  return buf
}
