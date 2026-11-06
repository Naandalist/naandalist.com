/**
 * An autumn tree, as a density field in grid cells.
 * A tree stands upright on the left: a straight trunk that forks into limbs, branches, and twigs,
 * with small leaves of mixed shades on every twig. Most of the time a light breeze carries a few
 * leaves off across the band. Every so often a gust comes through and the tree sways back and
 * forth, bending more toward the top, its leaves shivering. And now and then a strong wind tears
 * in from the left: streaks rush across the sky, the tree leans hard to the right, and a flurry
 * of leaves is ripped from the crown and flung across the whole band.
 * Under the tree a child flies a kite, high up on the right, on a long sagging string; the kite
 * bobs and tilts in the breeze, its tail flutters, and the strong wind pulls it further out.
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

/** The row the ground sits on. */
export const groundRow = (rows: number) => rows - 4 * K(rows)

/**
 * The gusts. Each `period` seconds a gust rolls through for `lasts` of that period, rising and
 * dying away. Two of them at different periods keep the rhythm from feeling mechanical.
 */
export const GUSTS = [
  { period: 11, lasts: 0.4, phase: 0.55, strength: 1 },
  { period: 17, lasts: 0.3, phase: 0.1, strength: 0.65 },
] as const

/** How strong the wind is at time t, 0 (still) to 1 (a full gust). */
export function gustAt(t: number): number {
  let g = 0
  for (const w of GUSTS) {
    const p = frac(t / w.period + w.phase)
    if (p < w.lasts) g = Math.max(g, Math.sin((p / w.lasts) * Math.PI) ** 2 * w.strength)
  }
  return g
}

/**
 * The strong wind: once every `every` seconds, first at `start`. It blows for `blow` seconds,
 * and the leaves it tears loose are still flying or settling until `lasts`.
 */
export const STORM = { every: 16, start: 12, blow: 5, lasts: 7.5 } as const

/** Seconds into the current strong wind, or -1 when there is none. */
export function stormClock(t: number): number {
  const s = frac((t - STORM.start) / STORM.every) * STORM.every
  return s < STORM.lasts ? s : -1
}

/** How hard the strong wind is blowing, 0..1: it slams in, holds, and drops away. */
export function stormAt(t: number): number {
  const s = stormClock(t)
  if (s < 0 || s > STORM.blow) return 0
  const p = s / STORM.blow
  const e = (x: number) => x * x * (3 - 2 * x)
  return p < 0.15 ? e(p / 0.15) : p > 0.7 ? e((1 - p) / 0.3) : 1
}

/** How far the top of the tree is bent, in 48 row units: it leans downwind and rocks back and forth in a gust, and bows hard in the strong wind. */
export function swayAt(t: number): number {
  const g = gustAt(t)
  const storm = stormAt(t)
  return g * (1.6 + 2.2 * Math.sin(t * 2.4)) + storm * (6 + 1.2 * Math.sin(t * 6.5)) + 0.15 * Math.sin(t * 0.8)
}

export interface Segment {
  x0: number
  y0: number
  x1: number
  y1: number
  /** Thickness at each end. */
  w0: number
  w1: number
}

export interface TreeLeaf {
  x: number
  y: number
  angle: number
  /** Ink, standing in for the mixed reds, oranges, and yellows. */
  v: number
}

/**
 * The tree's shape in local units at 48 rows: x to the right of the trunk, y up from the ground.
 * It is grown once, the same every time: each branch splits in two or three, shorter and
 * thinner, leaning gently back toward the sky, and the twigs carry the leaves.
 */
function grow(): { segments: Segment[]; leaves: TreeLeaf[]; height: number; reach: number } {
  const segments: Segment[] = []
  const leaves: TreeLeaf[] = []
  const leaf = (x: number, y: number, angle: number, id: number) => {
    const v = [0.6, 0.72, 0.84, 0.95][Math.floor(hash(id, 4.4) * 4)]
    leaves.push({ x, y, angle, v })
  }
  const branch = (x: number, y: number, angle: number, len: number, w: number, depth: number, id: number) => {
    const x1 = x + Math.cos(angle) * len
    const y1 = y + Math.sin(angle) * len
    segments.push({ x0: x, y0: y, x1, y1, w0: w, w1: w * 0.75 })
    if (depth <= 1) {
      // Leaves along the twig, alternating sides.
      const side = hash(id, 6.1) < 0.5 ? 1 : -1
      leaf(lerp(x, x1, 0.35), lerp(y, y1, 0.35), angle + side * 0.95, id * 7 + 4)
      leaf(lerp(x, x1, 0.6), lerp(y, y1, 0.6), angle - side * 0.95, id * 7 + 5)
      leaf(lerp(x, x1, 0.82), lerp(y, y1, 0.82), angle + side * 0.95, id * 7 + 6)
    }
    if (depth === 2) {
      // The thicker branches carry a few leaves too, so the crown fills in.
      leaf(lerp(x, x1, 0.6), lerp(y, y1, 0.6), angle + 1.1, id * 7 + 8)
      leaf(lerp(x, x1, 0.8), lerp(y, y1, 0.8), angle - 1.1, id * 7 + 9)
    }
    if (depth === 0) {
      // And a cluster at its tip.
      leaf(x1, y1, angle, id * 7 + 1)
      leaf(x1, y1, angle + 0.6, id * 7 + 2)
      leaf(x1, y1, angle - 0.6, id * 7 + 3)
      return
    }
    const n = depth >= 3 || hash(id, 1.7) < 0.6 ? 2 : 3
    const spread = 0.5 + 0.2 * hash(id, 2.9)
    for (let c = 0; c < n; c++) {
      const off = n === 2 ? (c === 0 ? -0.8 : 0.8) : c - 1
      const turn = angle + spread * off + (hash(id, c + 5.1) - 0.5) * 0.25
      // Branches lean back toward the sky, so the crown fans out upward.
      const up = lerp(turn, Math.PI / 2, 0.12)
      const shrink = 0.7 + 0.12 * hash(id, c + 8.3)
      branch(x1, y1, up, len * shrink, w * 0.66, depth - 1, id * 4 + c + 1)
    }
  }

  const fork = { x: 0.3, y: 14 }
  segments.push({ x0: 0, y0: 0, x1: fork.x, y1: fork.y, w0: 5.6, w1: 3.8 })
  branch(fork.x, fork.y, (Math.PI * 136) / 180, 11, 3, 3, 1)
  branch(fork.x, fork.y, (Math.PI * 46) / 180, 11.5, 3, 3, 2)
  // The middle limb climbs straight up and branches fully, so the top of the crown fills in.
  branch(fork.x, fork.y, (Math.PI * 92) / 180, 9.5, 2.4, 3, 3)
  // And a leader shoot straight up the middle closes the notch at the very top.
  branch(fork.x, fork.y, Math.PI / 2, 10.5, 1.6, 2, 4)

  let height = 0
  let reach = 0
  for (const s of segments) {
    height = Math.max(height, s.y1)
    reach = Math.max(reach, Math.abs(s.x1))
  }
  return { segments, leaves, height: height + 1.5, reach: reach + 1.5 }
}

export const TREE = grow()

export interface Tree {
  /** Base of the trunk. */
  x: number
  ground: number
  /** Cells per local unit: the 48 row scale, shrunk if needed so the crown fits under the top. */
  scale: number
  /** How far the top is bent right now, in local units. */
  sway: number
}

/** The tree stands on the left, sized to the band. */
export function treeAt(cols: number, rows: number, t: number): Tree {
  const k = K(rows)
  const ground = groundRow(rows)
  const scale = Math.min(k, (ground - 1.5) / TREE.height)
  return { x: Math.max(TREE.reach * scale + 2, cols * 0.16), ground, scale, sway: swayAt(t) }
}

/** A local point on the tree in grid cells, bent by the wind: the higher it is, the further it moves. */
export function bend(tree: Tree, x: number, y: number): [number, number] {
  const h = Math.max(0, y) / TREE.height
  return [tree.x + (x + tree.sway * h * h) * tree.scale, tree.ground - y * tree.scale]
}

/** How many leaves are falling at once. */
export const LEAF_COUNT = 18

export interface Leaf {
  x: number
  y: number
  angle: number
  alpha: number
  /** Down on the ground, resting. */
  landed: boolean
}

/** One falling leaf: it lets go of a twig and the breeze carries it off to the right, rocking side to side, until it rests on the ground and fades. Then it loops. */
export function leafAt(i: number, t: number, cols: number, rows: number): Leaf {
  const h = (n: number) => hash(i * 3.17 + n, n * 7.3 + 1.1)
  const still = { ...treeAt(cols, rows, 0), sway: 0 }
  const source = TREE.leaves[Math.floor(h(1) * TREE.leaves.length)]
  const [sx, sy] = bend(still, source.x, source.y)
  const p = frac(t * (0.045 + 0.03 * h(2)) + h(3))
  const ground = groundRow(rows) - 1
  const k = still.scale
  // Some settle near the tree; most ride the breeze well out across the band.
  const drift = (0.15 + 0.8 * h(4)) * Math.max(10 * k, cols - sx)
  const rock = (q: number) => Math.sin(q * 9 + h(5) * 6)
  const fall = 0.75
  const fade = p < 0.04 ? p / 0.04 : p > 0.85 ? (1 - p) / 0.15 : 1
  if (p < fall) {
    const q = p / fall
    const x = sx + q * drift + rock(q) * 2.2 * k * Math.min(1, q * 4)
    const y = lerp(sy, ground, q ** 1.6)
    return { x, y, angle: rock(q) * 0.9, alpha: fade, landed: false }
  }
  return { x: sx + drift + rock(1) * 2.2 * k, y: ground, angle: 0, alpha: fade, landed: true }
}

/** How many leaves the strong wind tears loose. */
export const BURST_COUNT = 60

/**
 * One leaf torn loose by the strong wind, or null while it is still on the tree or the wind is
 * calm. They let go one after another as the wind builds, then race right, tumbling, dropping
 * as they go: some land and lie still, the rest are blown off the edge.
 */
export function burstAt(j: number, t: number, cols: number, rows: number): Leaf | null {
  const clock = stormClock(t)
  if (clock < 0) return null
  const h = (n: number) => hash(j * 5.31 + n, n * 2.9 + 4.4)
  const s = clock - 0.4 - h(1) * STORM.blow * 0.6
  if (s < 0) return null
  const still = treeAt(cols, rows, 0)
  const k = still.scale
  const source = TREE.leaves[Math.floor(h(2) * TREE.leaves.length)]
  const [sx, sy] = bend({ ...still, sway: 5 }, source.x, source.y)
  const speed = (18 + 22 * h(3)) * k
  const drop = (2 + 4 * h(4)) * k
  const ground = groundRow(rows) - 1
  const fade = clock > STORM.lasts - 1.5 ? (STORM.lasts - clock) / 1.5 : 1
  const land = (ground - sy) / drop
  if (s < land) {
    const y = sy + s * drop + Math.sin(s * 6 + h(5) * 6) * 1.5 * k
    return { x: sx + s * speed, y: Math.min(ground, y), angle: s * (6 + 6 * h(6)), alpha: fade, landed: false }
  }
  return { x: sx + land * speed + Math.min(s - land, 0.6) * speed * 0.3, y: ground, angle: 0, alpha: fade, landed: true }
}

/** The streaks of the strong wind rushing left to right across the sky. */
function streaks(buf: Float32Array, cols: number, rows: number, t: number) {
  const storm = stormAt(t)
  if (storm <= 0) return
  const k = K(rows)
  const span = cols + 40 * k
  for (let i = 0; i < 9; i++) {
    const h = (n: number) => hash(i * 7.7 + n, n + 0.3)
    const len = (8 + 10 * h(1)) * k
    const head = frac(t * (0.55 + 0.35 * h(2)) + h(3)) * span - 20 * k
    const y = rows * (0.08 + 0.62 * h(4))
    for (let x = head - len; x <= head; x += 0.5) {
      const u = (x - head + len) / len
      // A thin dashed streak that thickens toward its head and bows a little.
      if (Math.floor(x * 0.7) % 3 === 2 && u < 0.6) continue
      plot(buf, cols, rows, x, y - Math.sin(u * Math.PI) * 0.8 * k, (0.25 + 0.4 * u) * storm)
    }
  }
}

/** The child, drawn this much larger than the tree's scale. */
const CHILD = 1.45

export interface Child {
  /** Feet, on the ground. */
  x: number
  y: number
  /** The hand holding the string. */
  handX: number
  handY: number
  /** How far the kite tugs the child forward, 0..1. */
  lean: number
  scale: number
}

/** The child stands under the right side of the crown, facing the kite, holding the string easily at chest height. */
export function childAt(cols: number, rows: number, t: number): Child {
  const tr = treeAt(cols, rows, t)
  const c = tr.scale * CHILD
  const x = tr.x + 13 * tr.scale
  const y = tr.ground
  const lean = Math.min(1, 0.15 + stormAt(t) * 0.85 + gustAt(t) * 0.3)
  // The hand bobs as the child works the string.
  const tug = Math.sin(t * 1.6) * 0.35 + Math.sin(t * 4.1) * 0.15 * lean
  return { x, y, handX: x + (3.2 + lean * 0.6) * c, handY: y - (5.9 + tug * 0.6) * c, lean, scale: c }
}

export interface Kite {
  x: number
  y: number
  /** Tilt of the kite from upright, in radians, positive leaning right. */
  angle: number
  /** Half its height, in cells. */
  size: number
}

/** The kite rides high on the right, bobbing and tilting in the breeze, pulled out further by the strong wind. */
export function kiteAt(cols: number, rows: number, t: number): Kite {
  const k = K(rows)
  const storm = stormAt(t)
  const size = 5.5 * k
  const x = cols * (0.76 + 0.03 * Math.sin(t * 0.45) + 0.08 * storm) + Math.sin(t * 1.3) * 1.5 * k
  const y = Math.max(size + 1.5, rows * 0.22 + Math.sin(t * 0.9) * 2 * k + Math.sin(t * 2.3) * 0.6 * k - storm * 2 * k)
  const angle = 0.3 + 0.15 * Math.sin(t * 1.3 + 0.5) + storm * (0.35 + 0.12 * Math.sin(t * 7))
  return { x: Math.min(cols - size - 2, x), y, angle, size }
}

function plot(buf: Float32Array, cols: number, rows: number, x: number, y: number, v: number) {
  const xi = Math.round(x)
  const yi = Math.round(y)
  if (xi < 0 || xi >= cols || yi < 0 || yi >= rows) return
  const i = yi * cols + xi
  if (v > buf[i]) buf[i] = v
}

/** A thick stroke: discs stamped along the segment, tapering from w0 to w1. */
function stroke(
  buf: Float32Array,
  cols: number,
  rows: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  w0: number,
  w1: number,
  v: number,
) {
  const steps = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 2))
  for (let n = 0; n <= steps; n++) {
    const u = n / steps
    const cx = lerp(x0, x1, u)
    const cy = lerp(y0, y1, u)
    const r = Math.max(0.35, lerp(w0, w1, u) / 2)
    for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) {
      for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
        if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r + 0.25) plot(buf, cols, rows, x, y, v)
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

/** The tree: trunk and branches first, then every leaf, shivering when the wind blows. */
function tree(buf: Float32Array, cols: number, rows: number, t: number) {
  const tr = treeAt(cols, rows, t)
  const s = tr.scale
  for (const seg of TREE.segments) {
    const [x0, y0] = bend(tr, seg.x0, seg.y0)
    const [x1, y1] = bend(tr, seg.x1, seg.y1)
    stroke(buf, cols, rows, x0, y0, x1, y1, seg.w0 * s, seg.w1 * s, 0.92)
  }
  // Root flare where the trunk meets the ground.
  const [bx, by] = bend(tr, 0, 0)
  stroke(buf, cols, rows, bx - 3.2 * s, by, bx + 3.2 * s, by, 1.2 * s, 1.2 * s, 0.92)

  const g = Math.max(gustAt(t), stormAt(t) * 1.4)
  TREE.leaves.forEach((l, i) => {
    const shiver = g * Math.sin(t * 9 + i * 1.3)
    const [x, y] = bend(tr, l.x + shiver * 0.35, l.y + g * Math.sin(t * 7 + i) * 0.25)
    leafShape(buf, cols, rows, x, y, l.angle + shiver * 0.6, 2.8 * s, l.v)
  })
}

/** The child: legs apart, a short tunic, a round head, one arm bent holding the string in front of the chest and one hanging down. */
function child(buf: Float32Array, cols: number, rows: number, t: number) {
  const ch = childAt(cols, rows, t)
  const c = ch.scale
  // Local point (x right, y up) in cells, leaning toward the kite from the feet up.
  const P = (x: number, y: number): [number, number] => [ch.x + (x + y * ch.lean * 0.12) * c, ch.y - y * c]
  const line = (a: [number, number], b: [number, number], w: number, v: number) => stroke(buf, cols, rows, a[0], a[1], b[0], b[1], w * c, w * c, v)
  const hip = P(0, 3.6)
  line(hip, P(-1.5, 0), 1, 0.92)
  line(hip, P(1.5, 0), 1, 0.92)
  // A short tunic, wider at the hem.
  stroke(buf, cols, rows, ...P(0, 3.4), ...P(0.1, 6.6), 3 * c, 2 * c, 0.92)
  // Upper arm down to a bent elbow, forearm out to the hand.
  const elbow = P(1.2, 4.9)
  line(P(0.4, 6.3), elbow, 0.8, 0.92)
  line(elbow, [ch.handX, ch.handY], 0.8, 0.92)
  line(P(-0.2, 6.3), P(-1.5, 4.2), 0.8, 0.92)
  // The head sits clear of the shoulders, with a gap of neck.
  const [hx, hy] = P(-0.2, 9)
  stroke(buf, cols, rows, hx, hy, hx, hy, 3 * c, 3 * c, 0.95)
}

/** The kite, its fluttering tail with little bows, and the long string sagging down to the child's hand. */
function kite(buf: Float32Array, cols: number, rows: number, t: number) {
  const kt = kiteAt(cols, rows, t)
  const ch = childAt(cols, rows, t)
  const k = K(rows)
  const ca = Math.cos(kt.angle)
  const sa = Math.sin(kt.angle)
  // Local point (u across, v up) on the kite, rotated by its tilt.
  const P = (u: number, v: number): [number, number] => [kt.x + u * ca + v * sa, kt.y + u * sa - v * ca]
  const h = kt.size
  const w = h * 0.72
  const top = P(0, h)
  const right = P(w, h * 0.25)
  const bottom = P(0, -h)
  const left = P(-w, h * 0.25)
  // Sail: filled, then a bright edge and the cross spars.
  for (let v = -h; v <= h; v += 0.35) {
    const half = v > h * 0.25 ? (w * (h - v)) / (h * 0.75) : (w * (v + h)) / (h * 1.25)
    for (let u = -half; u <= half; u += 0.35) {
      const [x, y] = P(u, v)
      plot(buf, cols, rows, x, y, 0.3)
    }
  }
  const edge = (a: [number, number], b: [number, number], v: number) => stroke(buf, cols, rows, a[0], a[1], b[0], b[1], 0.6, 0.6, v)
  edge(top, right, 0.95)
  edge(right, bottom, 0.95)
  edge(bottom, left, 0.95)
  edge(left, top, 0.95)
  edge(top, bottom, 0.85)
  edge(left, right, 0.85)

  // Tail: a ribbon trailing down and back from the bottom tip, a bow every few links.
  let [px, py] = bottom
  for (let i = 1; i <= 8; i++) {
    const nx = bottom[0] - i * 0.9 * k + Math.sin(t * 5 - i * 0.9) * 1.2 * k * Math.min(1, i / 2)
    const ny = bottom[1] + i * 0.7 * k
    stroke(buf, cols, rows, px, py, nx, ny, 0.4, 0.4, 0.75)
    if (i % 3 === 0) {
      stroke(buf, cols, rows, nx, ny - 0.7 * k, nx, ny + 0.7 * k, 0.5, 0.5, 0.85)
    }
    px = nx
    py = ny
  }

  // String: from the kite's bridle down to the hand, sagging under its own weight, tauter in the strong wind.
  const [sx, sy] = P(0, -h * 0.2)
  // The low point of the sag sits nearer the hand, like a real kite line.
  const sag = Math.hypot(sx - ch.handX, sy - ch.handY) * (0.06 - 0.035 * stormAt(t))
  const mx = lerp(ch.handX, sx, 0.4)
  const my = lerp(ch.handY, sy, 0.4) + sag
  const n = 48
  for (let i = 0; i <= n; i++) {
    const u = i / n
    const x = (1 - u) ** 2 * ch.handX + 2 * (1 - u) * u * mx + u * u * sx
    const y = (1 - u) ** 2 * ch.handY + 2 * (1 - u) * u * my + u * u * sy
    const nu = (i + 1) / n
    const x1 = (1 - nu) ** 2 * ch.handX + 2 * (1 - nu) * nu * mx + nu * nu * sx
    const y1 = (1 - nu) ** 2 * ch.handY + 2 * (1 - nu) * nu * my + nu * nu * sy
    if (i < n) stroke(buf, cols, rows, x, y, x1, y1, 0.4, 0.4, 0.55)
  }
}

/** One falling leaf, rocking as it drifts, lying flat once it lands. */
function fallingLeaf(buf: Float32Array, cols: number, rows: number, l: Leaf, k: number) {
  if (l.alpha < 0.05) return
  leafShape(buf, cols, rows, l.x, l.y, l.angle, 2 * k, 0.85 * l.alpha)
}

/** The ground: a line, and a scatter of fallen leaves gathered under the crown. */
export function groundField(cols: number, rows: number): Float32Array {
  const buf = new Float32Array(cols * rows)
  const tr = treeAt(cols, rows, 0)
  const g = groundRow(rows)
  const spread = TREE.reach * tr.scale
  for (let c = 0; c < cols; c++) {
    const y = g + Math.sin(c * 0.07) * 0.4
    plot(buf, cols, rows, c, y, 0.45)
    const near = Math.max(0, 1 - Math.abs(c - tr.x) / spread)
    if (hash(c * 1.3, 7.7) < near * 0.55) plot(buf, cols, rows, c, y - 1, 0.6 + 0.3 * hash(c, 2.2))
    if (hash(c * 2.1, 3.3) < near * 0.3) plot(buf, cols, rows, c, y + 1, 0.5)
    // Leaves blown out across the rest of the ground, thinning toward the far edge.
    if (near === 0 && hash(c * 3.7, 9.1) < 0.14 * (1 - (0.5 * c) / cols)) {
      plot(buf, cols, rows, c, y - 1, 0.7)
      plot(buf, cols, rows, c + 1, y - 1, 0.6)
    }
  }
  return buf
}

/** One frame: the ground, any wind streaks, the tree, the child and the kite, then the leaves in the air. Values are 0..1 per cell. */
export function compose(cols: number, rows: number, t: number, ground?: Float32Array): Float32Array {
  const buf = ground ? Float32Array.from(ground) : groundField(cols, rows)
  streaks(buf, cols, rows, t)
  tree(buf, cols, rows, t)
  child(buf, cols, rows, t)
  kite(buf, cols, rows, t)
  const k = treeAt(cols, rows, t).scale
  for (let i = 0; i < LEAF_COUNT; i++) fallingLeaf(buf, cols, rows, leafAt(i, t, cols, rows), k)
  for (let j = 0; j < BURST_COUNT; j++) {
    const l = burstAt(j, t, cols, rows)
    if (l) fallingLeaf(buf, cols, rows, l, k)
  }
  return buf
}
