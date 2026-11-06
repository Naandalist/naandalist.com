import { describe, it, expect } from 'bun:test'
import {
  BURST_COUNT,
  LEAF_COUNT,
  STORM,
  TREE,
  bend,
  burstAt,
  childAt,
  compose,
  groundField,
  groundRow,
  gustAt,
  kiteAt,
  leafAt,
  stormAt,
  stormClock,
  swayAt,
  treeAt,
} from '../src/lib/autumn'

const SIZES = [
  [150, 40],
  [170, 40],
  [288, 48],
  [400, 48],
] as const

describe('the tree', () => {
  it('stands upright: the trunk rises straight from its base to the fork', () => {
    const trunk = TREE.segments[0]
    expect(Math.abs(trunk.x1 - trunk.x0)).toBeLessThan(1)
    expect(trunk.y1).toBeGreaterThan(10)
  })

  it('branches into a crown wider than it is tall, with leaves on the twigs', () => {
    expect(TREE.segments.length).toBeGreaterThan(20)
    expect(TREE.leaves.length).toBeGreaterThan(40)
    const xs = TREE.leaves.map((l) => l.x)
    const ys = TREE.leaves.map((l) => l.y)
    expect(Math.max(...xs) - Math.min(...xs)).toBeGreaterThan(Math.max(...ys) - Math.min(...ys))
    expect(Math.min(...xs)).toBeLessThan(0)
    expect(Math.max(...xs)).toBeGreaterThan(0)
  })

  it('fits inside the band at every size, on the left', () => {
    for (const [cols, rows] of SIZES) {
      const tr = { ...treeAt(cols, rows, 0), sway: 0 }
      expect(tr.x).toBeLessThan(cols * 0.35)
      for (const l of TREE.leaves) {
        const [x, y] = bend(tr, l.x, l.y)
        expect(x).toBeGreaterThan(0)
        expect(y).toBeGreaterThan(0)
      }
    }
  })
})

describe('the wind', () => {
  it('is still most of the time, with gusts now and then', () => {
    let still = 0
    let peak = 0
    const n = 600
    for (let i = 0; i < n; i++) {
      const g = gustAt(i * 0.1)
      if (g < 0.05) still++
      peak = Math.max(peak, g)
    }
    expect(still / n).toBeGreaterThan(0.4)
    expect(peak).toBeGreaterThan(0.9)
  })

  it('a strong wind blows in from the left once a cycle and drops away', () => {
    expect(stormAt(STORM.start + STORM.blow / 2)).toBe(1)
    expect(stormAt(STORM.start - 1)).toBe(0)
    expect(stormAt(STORM.start + STORM.blow + 0.1)).toBe(0)
    expect(stormAt(STORM.start + STORM.blow / 2 + STORM.every)).toBe(1)
  })

  it('bends the tree to the right, hardest in the strong wind', () => {
    const calm = Math.abs(swayAt(STORM.start - 2.5))
    const storm = swayAt(STORM.start + STORM.blow / 2)
    expect(storm).toBeGreaterThan(4)
    expect(storm).toBeGreaterThan(calm * 3)
  })
})

describe('leafAt', () => {
  it('drifts right and down from the crown, and never sinks below the ground', () => {
    for (const [cols, rows] of SIZES) {
      for (let i = 0; i < LEAF_COUNT; i++) {
        for (let t = 0; t < 40; t += 0.9) {
          const l = leafAt(i, t, cols, rows)
          expect(l.y).toBeLessThanOrEqual(groundRow(rows))
          expect(l.y).toBeGreaterThan(0)
          expect(l.alpha).toBeGreaterThanOrEqual(0)
          expect(l.alpha).toBeLessThanOrEqual(1)
        }
      }
    }
  })

  it('carries some leaves well out across the band', () => {
    let far = 0
    for (let i = 0; i < LEAF_COUNT; i++) {
      for (let t = 0; t < 60; t += 1) if (leafAt(i, t, 288, 48).x > 288 * 0.6) far++
    }
    expect(far).toBeGreaterThan(0)
  })
})

describe('burstAt', () => {
  it('only tears leaves loose while the strong wind is on', () => {
    for (let j = 0; j < BURST_COUNT; j++) expect(burstAt(j, STORM.start - 1, 288, 48)).toBeNull()
  })

  it('sends a flurry of leaves racing right, some landing, none below the ground', () => {
    const t = STORM.start + STORM.blow * 0.8
    const leaves = Array.from({ length: BURST_COUNT }, (_, j) => burstAt(j, t, 288, 48)).filter((l) => l !== null)
    expect(leaves.length).toBeGreaterThan(BURST_COUNT / 2)
    expect(leaves.some((l) => l.x > 288 * 0.5)).toBe(true)
    for (const l of leaves) expect(l.y).toBeLessThanOrEqual(groundRow(48))
    for (let s = 0; s < STORM.lasts; s += 0.25) expect(stormClock(STORM.start + s)).toBeCloseTo(s, 6)
  })
})

describe('the child and the kite', () => {
  it('the child stands on the ground under the tree, holding the string at chest height', () => {
    for (const [cols, rows] of SIZES) {
      for (let t = 0; t < 40; t += 0.7) {
        const ch = childAt(cols, rows, t)
        const tr = treeAt(cols, rows, t)
        expect(ch.y).toBe(groundRow(rows))
        expect(ch.x).toBeGreaterThan(tr.x)
        expect(ch.x - tr.x).toBeLessThan(TREE.reach * tr.scale)
        // Chest height: about the middle of a child roughly ten units tall, not up at the head.
        const height = (ch.y - ch.handY) / ch.scale
        expect(height).toBeGreaterThan(4.5)
        expect(height).toBeLessThan(7.5)
        expect(ch.handX).toBeGreaterThan(ch.x)
      }
    }
  })

  it('the kite flies high on the right and stays inside the band', () => {
    for (const [cols, rows] of SIZES) {
      for (let t = 0; t < 40; t += 0.7) {
        const kt = kiteAt(cols, rows, t)
        expect(kt.x).toBeGreaterThan(cols * 0.6)
        expect(kt.x + kt.size).toBeLessThan(cols)
        expect(kt.y - kt.size).toBeGreaterThan(0)
        expect(kt.y).toBeLessThan(rows * 0.4)
      }
    }
  })

  it('the strong wind pulls the kite further out and tilts it harder', () => {
    const calm = kiteAt(288, 48, STORM.start - 2.5)
    const storm = kiteAt(288, 48, STORM.start + STORM.blow / 2)
    expect(storm.x).toBeGreaterThan(calm.x)
    expect(storm.angle).toBeGreaterThan(calm.angle)
  })
})

describe('compose', () => {
  const COLS = 288
  const ROWS = 48
  const at = (f: Float32Array, c: number, r: number) => f[Math.round(r) * COLS + Math.round(c)]

  it('keeps every value between 0 and 1 and is deterministic', () => {
    for (const t of [2.4, STORM.start + 2]) {
      const f = compose(COLS, ROWS, t)
      for (const v of f) {
        expect(v).toBeGreaterThanOrEqual(0)
        expect(v).toBeLessThanOrEqual(1)
      }
      expect(Array.from(compose(COLS, ROWS, t))).toEqual(Array.from(f))
    }
  })

  it('draws a dark trunk', () => {
    const f = compose(COLS, ROWS, 2.4)
    const tr = treeAt(COLS, ROWS, 2.4)
    const [x, y] = bend(tr, 0.1, 6)
    expect(at(f, x, y)).toBeGreaterThan(0.8)
  })

  it('fills the right side with leaves when the strong wind blows', () => {
    const f = compose(COLS, ROWS, STORM.start + STORM.blow * 0.8)
    let ink = 0
    for (let r = 0; r < groundRow(ROWS) - 2; r++) {
      for (let c = Math.floor(COLS / 2); c < COLS; c++) if (at(f, c, r) > 0.5) ink++
    }
    expect(ink).toBeGreaterThan(30)
  })

  it('has a stable ground with fallen leaves spread across it', () => {
    const g = groundField(COLS, ROWS)
    expect(Array.from(groundField(COLS, ROWS))).toEqual(Array.from(g))
    let right = 0
    for (let c = Math.floor(COLS / 2); c < COLS; c++) if (at(g, c, groundRow(ROWS) - 1) > 0.5) right++
    expect(right).toBeGreaterThan(3)
  })
})
