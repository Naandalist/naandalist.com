/**
 * An abstract city skyline as a density field, in grid cells.
 * Two rows of towers drawn as simple slabs: a pale, lower row behind and a bolder, taller row in
 * front that hides it. A slab is a gradient that thickens toward the ground, with a few vertical
 * pinstripes or a horizontal band of light that drifts slowly up and down. Some are only an
 * outline, some narrow to a spire. A road line runs along the foot.
 * Everything is pure. The canvas only compares density with a Bayer threshold.
 */

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

function hash(x: number, y: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return s - Math.floor(s)
}

/** The road line the towers stand on. It does not move, so compute it once per size. */
export function groundField(cols: number, rows: number): Float32Array {
  const f = new Float32Array(cols * rows)
  for (let c = 0; c < cols; c++) f[(rows - 1) * cols + c] = 0.85
  return f
}

interface Layer {
  seed: number
  minW: number
  maxW: number
  minH: number
  maxH: number
  edge: number
  wall: number
  lit: number
  dim: number
}

const BACK: Layer = { seed: 11, minW: 6, maxW: 12, minH: 0.3, maxH: 0.7, edge: 0.4, wall: 0.08, lit: 0.4, dim: 0 }
const FRONT: Layer = { seed: 3, minW: 8, maxW: 17, minH: 0.42, maxH: 0.96, edge: 0.9, wall: 0.2, lit: 0.8, dim: 0 }

function set(buf: Float32Array, cols: number, rows: number, x: number, y: number, v: number) {
  if (x < 0 || x >= cols || y < 0 || y >= rows) return
  buf[y * cols + x] = v
}

/** One row of towers, left to right with a small gap between neighbors. Later layers overwrite earlier ones. */
function skyline(buf: Float32Array, cols: number, rows: number, t: number, L: Layer) {
  const roadTop = rows - 2
  let x = Math.floor(hash(L.seed, 0) * 4)
  for (let n = 0; x < cols; n++) {
    const w = Math.round(L.minW + hash(n, L.seed) * (L.maxW - L.minW))
    const h = Math.round((L.minH + hash(n, L.seed + 1.7) * (L.maxH - L.minH)) * rows * 0.92)
    const top = roadTop - h
    const kind = hash(n, L.seed + 4.2)
    const outline = kind < 0.25
    const striped = kind >= 0.25 && kind < 0.6
    const spire = hash(n, L.seed + 6.6) > 0.6
    // A drifting band of light, as tall as a few rows, that slides along this tower.
    const bandY = top + ((Math.sin(t * 0.35 + n * 2.1) * 0.5 + 0.5) * 0.8 + 0.1) * h
    for (let r = top; r <= roadTop; r++) {
      const depth = (r - top) / Math.max(1, h)
      // A spire tower narrows toward its top by one cell per few rows.
      const inset = spire ? Math.max(0, Math.floor((0.35 - depth) * w * 0.6)) : 0
      for (let c = x + inset; c < x + w - inset; c++) {
        const edge = r === top || c === x + inset || c === x + w - 1 - inset
        if (outline) {
          if (edge) set(buf, cols, rows, c, r, L.edge)
          continue
        }
        let v = L.wall + depth * 0.25
        if (striped && (c - x) % 3 === 1) v += 0.35
        if (Math.abs(r - bandY) < 1.5) v = L.lit
        if (edge) v = Math.max(v, L.edge * 0.7)
        set(buf, cols, rows, c, r, clamp01(v))
      }
    }
    if (spire) {
      const ax = x + Math.floor(w / 2)
      const len = 4 + Math.round(hash(n, L.seed + 8.8) * 6)
      for (let k = 1; k <= len; k++) set(buf, cols, rows, ax, top - k, L.edge)
    }
    x += w + (hash(n, L.seed + 2.3) > 0.6 ? 1 : 0)
  }
}

/** One frame: the road, the far row of towers, then the near row. Values are 0..1 per cell. */
export function compose(cols: number, rows: number, t: number, ground?: Float32Array): Float32Array {
  const buf = ground ? Float32Array.from(ground) : groundField(cols, rows)
  skyline(buf, cols, rows, t, BACK)
  skyline(buf, cols, rows, t, FRONT)
  return buf
}
