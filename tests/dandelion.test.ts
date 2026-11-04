import { describe, it, expect } from 'bun:test'
import { compose, groundField, headGeometry, seedAt, SEED_COUNT } from '../src/lib/dandelion'

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
