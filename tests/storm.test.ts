import { describe, it, expect } from 'bun:test'
import { compose, groundField, seaSurface, shipAt, gullAt, WAVES, GULLS, GULL_COUNT } from '../src/lib/storm'

const COLS = 150
const ROWS = 40

describe('seaSurface', () => {
  it('keeps every wave layer inside the band', () => {
    for (let layer = 0; layer < WAVES.length; layer++) {
      for (let x = 0; x < COLS; x += 3) {
        for (let t = 0; t < 30; t += 0.9) {
          const y = seaSurface(x, t, ROWS, layer)
          expect(y).toBeGreaterThan(ROWS * 0.3)
          expect(y).toBeLessThan(ROWS - 1)
        }
      }
    }
  })
})

describe('shipAt', () => {
  it('rides on the main swell and pitches with it, but never capsizes', () => {
    for (let t = 0; t < 30; t += 0.5) {
      const s = shipAt(COLS, ROWS, t)
      expect(s.y).toBeGreaterThan(ROWS * 0.3)
      expect(s.y).toBeLessThan(ROWS - 2)
      expect(s.mastY).toBeLessThan(s.y)
      expect(s.mastY).toBeGreaterThan(0)
      expect(Math.abs(s.tilt)).toBeLessThan(0.5)
    }
  })

  it('bobs: the ship is higher on a crest than in a trough', () => {
    let moved = false
    for (let t = 0; t < 20; t += 0.5) {
      if (shipAt(COLS, ROWS, t + 0.5).y !== shipAt(COLS, ROWS, t).y) moved = true
    }
    expect(moved).toBe(true)
  })
})

describe('gullAt', () => {
  it('crosses the sky above the waves and loops around', () => {
    for (let t = 0; t < 30; t += 0.7) {
      for (let i = 0; i < GULL_COUNT; i++) {
        const g = gullAt(i, t, COLS, ROWS)
        expect(g.x).toBeGreaterThan(-6)
        expect(g.x).toBeLessThan(COLS + 6)
        expect(g.y).toBeGreaterThan(0)
        expect(g.y).toBeLessThan(ROWS * 0.35)
        expect(g.alpha).toBeGreaterThanOrEqual(0)
        expect(g.alpha).toBeLessThanOrEqual(1)
      }
    }
    const period = 1 / GULLS[0].speed
    const a = gullAt(0, 4, COLS, ROWS)
    const b = gullAt(0, 4 + period, COLS, ROWS)
    expect(b.x).toBeCloseTo(a.x, 6)
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

  it('fills the lower sea with the rolling waves', () => {
    const f = compose(COLS, ROWS, 2.4)
    let hit = 0
    for (let r = Math.floor(ROWS * 0.6); r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) if (at(f, c, r) > 0.2) hit++
    }
    expect(hit).toBeGreaterThan((ROWS - Math.floor(ROWS * 0.6)) * COLS * 0.15)
  })

  it('has the ship standing on the swell with its mast up', () => {
    const f = compose(COLS, ROWS, 2.4)
    const s = shipAt(COLS, ROWS, 2.4)
    expect(at(f, s.mastX, s.mastY)).toBeGreaterThan(0.5)
    // The deck runs just above the waterline; find it near the mast within the pitch offset.
    let deck = false
    for (let dc = -2; dc <= 2; dc++) if (at(f, s.x + dc, s.y - 1.4 * (ROWS / 48)) > 0.5) deck = true
    expect(deck).toBe(true)
  })

  it('moves: waves, ship, gulls, and rain change the picture over time', () => {
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
