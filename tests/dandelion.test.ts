import { describe, it, expect } from 'bun:test'
import { compose, groundField, headGeometry, seedAt, butterflyAt, BUTTERFLIES, BUTTERFLY_COUNT, PLANTS, SHAPES, SEED_COUNT } from '../src/lib/dandelion'

const COLS = 150
const ROWS = 40

describe('headGeometry', () => {
  it('puts a round head on the left, well above the ground', () => {
    const h = headGeometry(COLS, ROWS)
    expect(h.cx).toBeLessThan(COLS * 0.35)
    expect(h.cy + h.r).toBeLessThan(ROWS * 0.85)
    expect(h.r).toBeGreaterThan(ROWS * 0.15)
  })
})

describe('SHAPES', () => {
  it('gives each of the five plants its own head shape', () => {
    expect(SHAPES.length).toBe(PLANTS.length)
    expect(new Set(SHAPES.map((s) => `${s.rx}/${s.ry}/${s.spokes}/${s.len}/${s.gapW}`)).size).toBe(SHAPES.length)
  })
})

describe('seedAt', () => {
  it('blows seeds from the head to the right, each at its own pace', () => {
    const a = seedAt(0, 0, COLS, ROWS)
    const b = seedAt(0, 1.5, COLS, ROWS)
    const moved = SEED_COUNT
    expect(b.x).toBeGreaterThan(a.x)
    expect(moved).toBeGreaterThanOrEqual(7)
    const speeds = new Set(Array.from({ length: SEED_COUNT }, (_, i) => (seedAt(i, 1, COLS, ROWS).x - seedAt(i, 0, COLS, ROWS).x).toFixed(1)))
    expect(speeds.size).toBeGreaterThan(3)
  })

  it('shows several seeds in the air at the still frame and keeps them on screen', () => {
    const live = Array.from({ length: SEED_COUNT }, (_, i) => seedAt(i, 2.4, COLS, ROWS)).filter((s) => s.alpha > 0.3)
    expect(live.length).toBeGreaterThanOrEqual(5)
    for (let t = 0; t < 30; t += 0.7) {
      for (let i = 0; i < SEED_COUNT; i++) {
        const s = seedAt(i, t, COLS, ROWS)
        expect(s.x).toBeGreaterThan(-5)
        expect(s.x).toBeLessThan(COLS + 10)
      }
    }
  })
})

describe('butterflyAt', () => {
  it('crosses the band low over the grass with its wings between closed and open', () => {
    for (let t = 0; t < 30; t += 0.7) {
      for (let i = 0; i < BUTTERFLY_COUNT; i++) {
        const b = butterflyAt(i, t, COLS, ROWS)
        expect(b.x).toBeGreaterThan(-6)
        expect(b.x).toBeLessThan(COLS + 6)
        expect(b.y).toBeGreaterThan(ROWS * 0.5)
        expect(b.y).toBeLessThan(ROWS - 1)
        expect(b.flap).toBeGreaterThanOrEqual(-1)
        expect(b.flap).toBeLessThanOrEqual(1)
        expect(b.alpha).toBeGreaterThanOrEqual(0)
        expect(b.alpha).toBeLessThanOrEqual(1)
      }
    }
  })

  it('loops: after one full crossing the butterfly is back where it started', () => {
    const period = 1 / BUTTERFLIES[0].speed
    const a = butterflyAt(0, 4, COLS, ROWS)
    const b = butterflyAt(0, 4 + period, COLS, ROWS)
    expect(b.x).toBeCloseTo(a.x, 6)
  })

  it('moves: the same butterfly is elsewhere a moment later', () => {
    expect(butterflyAt(0, 2, COLS, ROWS).x).not.toBe(butterflyAt(0, 0, COLS, ROWS).x)
  })
})

describe('compose', () => {
  const at = (f: Float32Array, c: number, r: number) => f[Math.round(r) * COLS + Math.round(c)]

  it('keeps every value between 0 and 1 and is deterministic', () => {
    const f = compose(COLS, ROWS, 2.4)
    for (const v of f) {
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThanOrEqual(1)
    }
    expect(Array.from(compose(COLS, ROWS, 2.4))).toEqual(Array.from(f))
  })

  it('leaves the middle of the head hollow and fills the ring around it', () => {
    const h = headGeometry(COLS, ROWS)
    const f = compose(COLS, ROWS, 0)
    expect(at(f, h.cx, h.cy)).toBe(0)
    let ring = 0
    for (let a = 0; a < Math.PI * 2; a += 0.2) ring += at(f, h.cx + Math.cos(a) * h.r * 0.6, h.cy + Math.sin(a) * h.r * 0.6) > 0.3 ? 1 : 0
    expect(ring).toBeGreaterThan(20)
  })

  it('draws a stem from the head down to the base', () => {
    const h = headGeometry(COLS, ROWS)
    const f = compose(COLS, ROWS, 0)
    let hit = 0
    for (let r = Math.ceil(h.cy + h.r + 2); r < ROWS - 1; r++) {
      for (let c = Math.floor(h.cx - 6); c <= h.cx + 6; c++) if (at(f, c, r) > 0.3) { hit++; break }
    }
    expect(hit).toBeGreaterThanOrEqual(Math.floor(ROWS - 1 - (h.cy + h.r + 2)))
  })

  it('blows a wedge open on the windward side of the half-blown plant', () => {
    const h = headGeometry(COLS, ROWS, 1)
    const f = compose(COLS, ROWS, 0)
    let gapFilled = 0
    let leftFilled = 0
    for (let r = Math.floor(h.cy - h.r); r <= Math.ceil(h.cy + h.r); r++) {
      for (let c = Math.floor(h.cx - h.r * 1.5); c <= Math.ceil(h.cx + h.r * 1.5); c++) {
        // Read the body ring only, clear of the rim where the flying seeds pass.
        const d = Math.hypot((c - h.cx) / h.r, (r - h.cy) / h.r)
        if (d < 0.35 || d > 0.65) continue
        const a = Math.atan2(r - h.cy, c - h.cx)
        if (Math.abs(a) < 0.55) {
          if (at(f, c, r) > 0.15) gapFilled++
        } else if (Math.abs(a) > 2.6) {
          if (at(f, c, r) > 0.3) leftFilled++
        }
      }
    }
    expect(gapFilled).toBe(0)
    expect(leftFilled).toBeGreaterThan(4)
  })

  it('moves: seeds fly so the picture changes over time', () => {
    const a = compose(COLS, ROWS, 0)
    const b = compose(COLS, ROWS, 2)
    let diff = 0
    for (let i = 0; i < a.length; i++) if (Math.abs(a[i] - b[i]) > 0.3) diff++
    expect(diff).toBeGreaterThan(60)
  })

  it('has a stable ground', () => {
    expect(Array.from(groundField(COLS, ROWS))).toEqual(Array.from(groundField(COLS, ROWS)))
  })
})
