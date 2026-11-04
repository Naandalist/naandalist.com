import { describe, it, expect } from 'bun:test'
import { compose, groundField, plantGeometry, petalAt, PETAL_COUNT, PLANTS } from '../src/lib/babys-breath'

const COLS = 140
const ROWS = 44

describe('plantGeometry', () => {
  it('grows airy plants: many thin stems, many twigs, and many tiny flowers', () => {
    const g = plantGeometry(COLS, ROWS, 0)
    expect(g.segs.length).toBeGreaterThan(PLANTS.length * 60)
    expect(g.flowers.length).toBeGreaterThan(PLANTS.length * 40)
  })

  it('fans several stems out from the base of each plant, not one trunk', () => {
    const g = plantGeometry(COLS, ROWS, 0)
    const stems = g.segs.filter((s) => s.depth === 0)
    // Each stem is drawn as several short segments, and a plant has at least five stems.
    const bases = new Set(stems.filter((s) => s.y0 >= ROWS - 2).map((s) => `${Math.round(s.x0)}:${Math.round(s.y0)}`))
    expect(bases.size).toBeGreaterThanOrEqual(PLANTS.length)
    const roots = stems.filter((s) => s.y0 >= ROWS - 2)
    expect(roots.length).toBeGreaterThanOrEqual(PLANTS.length * 5)
  })

  it('spreads wider than it is tall, like a cloud of blossoms', () => {
    const g = plantGeometry(COLS, ROWS, 0)
    const f = g.flowers
    const w = Math.max(...f.map((p) => p.x)) - Math.min(...f.map((p) => p.x))
    const h = Math.max(...f.map((p) => p.y)) - Math.min(...f.map((p) => p.y))
    expect(w).toBeGreaterThan(h * 2)
  })

  it('keeps flowers on thin twigs, mostly in the upper part of each plant', () => {
    const g = plantGeometry(COLS, ROWS, 0)
    const high = g.flowers.filter((p) => p.y < ROWS * 0.7).length
    expect(high / g.flowers.length).toBeGreaterThan(0.7)
  })

  it('stays inside the band and leaves the top rows empty', () => {
    for (const t of [0, 1.3, 4.7, 9]) {
      const g = plantGeometry(COLS, ROWS, t)
      const topmost = Math.min(...g.segs.map((s) => Math.min(s.y0, s.y1)), ...g.flowers.map((f) => f.y))
      expect(topmost).toBeGreaterThan(ROWS * 0.04)
    }
  })

  it('leans the way the wind blows: tips sit to the right of their bases on average', () => {
    let lean = 0
    let n = 0
    for (let t = 0; t < 20; t += 0.7) {
      for (const tip of plantGeometry(COLS, ROWS, t).tips) {
        lean += tip.x - tip.baseX
        n++
      }
    }
    expect(lean / n).toBeGreaterThan(0)
  })

  it('sways over time, but never far', () => {
    const a = plantGeometry(COLS, ROWS, 0)
    const b = plantGeometry(COLS, ROWS, 1.6)
    expect(a.flowers.length).toBe(b.flowers.length)
    let moved = 0
    let maxMove = 0
    a.flowers.forEach((f, i) => {
      const d = Math.hypot(f.x - b.flowers[i].x, f.y - b.flowers[i].y)
      if (d > 0.2) moved++
      maxMove = Math.max(maxMove, d)
    })
    expect(moved).toBeGreaterThan(a.flowers.length * 0.4)
    expect(maxMove).toBeLessThan(ROWS * 0.4)
  })

  it('is deterministic', () => {
    expect(plantGeometry(COLS, ROWS, 3.3)).toEqual(plantGeometry(COLS, ROWS, 3.3))
  })
})

describe('petalAt', () => {
  it('there are many petals in the air', () => {
    expect(PETAL_COUNT).toBeGreaterThanOrEqual(20)
    let visible = 0
    for (let i = 0; i < PETAL_COUNT; i++) if (petalAt(i, 2.4, COLS, ROWS).alpha > 0.3) visible++
    expect(visible).toBeGreaterThanOrEqual(8)
  })
  it('drifts left to right', () => {
    expect(petalAt(2, 1.4, COLS, ROWS).x).toBeGreaterThan(petalAt(2, 1.0, COLS, ROWS).x)
  })
  it('flies at different heights and speeds', () => {
    const ys = new Set(Array.from({ length: PETAL_COUNT }, (_, i) => Math.round(petalAt(i, 3, COLS, ROWS).y / 4)))
    expect(ys.size).toBeGreaterThanOrEqual(4)
    expect(petalAt(1, 2, COLS, ROWS).x - petalAt(1, 1, COLS, ROWS).x).not.toBeCloseTo(petalAt(4, 2, COLS, ROWS).x - petalAt(4, 1, COLS, ROWS).x, 1)
  })
  it('stays on screen while visible', () => {
    for (let i = 0; i < PETAL_COUNT; i++) {
      for (let t = 0; t < 40; t += 0.41) {
        const p = petalAt(i, t, COLS, ROWS)
        expect(p.alpha).toBeGreaterThanOrEqual(0)
        expect(p.alpha).toBeLessThanOrEqual(1)
        if (p.alpha > 0.05) {
          expect(p.x).toBeGreaterThanOrEqual(-3)
          expect(p.x).toBeLessThanOrEqual(COLS + 5)
          expect(p.y).toBeGreaterThan(-2)
          expect(p.y).toBeLessThan(ROWS + 2)
        }
      }
    }
  })
})

describe('compose', () => {
  const ground = groundField(COLS, ROWS)
  it('returns one value per cell, between 0 and 1', () => {
    for (const t of [0, 2.2, 8]) {
      const f = compose(COLS, ROWS, t, ground)
      expect(f.length).toBe(COLS * ROWS)
      for (const v of f) {
        expect(v).toBeGreaterThanOrEqual(0)
        expect(v).toBeLessThanOrEqual(1)
      }
    }
  })
  it('draws many bright flowers on thinner stems, and keeps the top rows empty', () => {
    const f = compose(COLS, ROWS, 1, ground)
    let bright = 0
    for (const v of f) if (v > 0.9) bright++
    expect(bright).toBeGreaterThan(150)
    let top = 0
    for (let c = 0; c < COLS; c++) top = Math.max(top, f[c])
    expect(top).toBeLessThan(0.2)
  })
  it('does not change the ground between frames, only the plants and petals', () => {
    const a = compose(COLS, ROWS, 0, ground)
    const b = compose(COLS, ROWS, 2, ground)
    let groundDiff = 0
    for (let c = 0; c < COLS; c++) groundDiff += Math.abs(a[(ROWS - 1) * COLS + c] - b[(ROWS - 1) * COLS + c])
    expect(groundDiff).toBeLessThan(COLS * 0.25)
    let changed = 0
    for (let i = 0; i < a.length; i++) if (Math.abs(a[i] - b[i]) > 0.3) changed++
    expect(changed).toBeGreaterThan(80)
  })
})
