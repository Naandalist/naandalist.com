import { describe, it, expect } from 'bun:test'
import {
  BITE,
  BOAT_SCALE,
  CATCH,
  FLOCKS,
  SLOSH,
  type Stage,
  biteAt,
  boatAt,
  compose,
  fishingAt,
  groundField,
  gullsAt,
  interfaceAt,
  stageAt,
} from '../src/lib/fishing'

const COLS = 150
const ROWS = 40
const SIZES = [
  [150, 40],
  [170, 40],
  [288, 48],
  [400, 48],
] as const

describe('interfaceAt', () => {
  it('keeps the water inside the band, with sky above it', () => {
    for (const [cols, rows] of SIZES) {
      for (let x = 0; x < cols; x += 3) {
        for (let t = 0; t < 30; t += 0.7) {
          const y = interfaceAt(x, t, cols, rows)
          expect(y).toBeGreaterThan(rows * 0.35)
          expect(y).toBeLessThan(rows - 4)
        }
      }
    }
  })

  it('rolls: the two ends rise and fall against each other', () => {
    const quarter = SLOSH.period / 4
    const left = interfaceAt(0, quarter, COLS, ROWS) - interfaceAt(0, 3 * quarter, COLS, ROWS)
    const right = interfaceAt(COLS, quarter, COLS, ROWS) - interfaceAt(COLS, 3 * quarter, COLS, ROWS)
    expect(Math.sign(left)).toBe(-Math.sign(right))
    expect(Math.abs(left)).toBeGreaterThan(4)
  })
})

describe('boatAt', () => {
  it('stays moored at the right edge and rides the water', () => {
    for (const [cols, rows] of SIZES) {
      const x = boatAt(cols, rows, 0).x
      expect(x).toBeGreaterThan(cols * 0.75)
      for (let t = 0; t < 30; t += 0.5) {
        const b = boatAt(cols, rows, t)
        expect(b.x).toBe(x)
        expect(b.y).toBeCloseTo(interfaceAt(b.x, t, cols, rows), 6)
        expect(Math.abs(b.tilt)).toBeLessThan(0.4)
      }
    }
  })

  it('keeps the fisherman and his rod inside the band', () => {
    for (const [cols, rows] of SIZES) {
      for (let t = 0; t < 30; t += 0.5) {
        const b = boatAt(cols, rows, t)
        // The top of his hat is 11.2 units above the waterline.
        expect(b.y - 11.2 * BOAT_SCALE * (rows / 48) - 1).toBeGreaterThan(0)
        const f = fishingAt(cols, rows, t)
        expect(f.tipY).toBeGreaterThan(0)
        expect(f.floatX).toBeLessThan(b.x)
      }
    }
  })
})

describe('biteAt', () => {
  it('is quiet most of the time and nibbles once per cycle', () => {
    let quiet = 0
    let peak = 0
    const n = 1000
    for (let i = 0; i < n; i++) {
      const v = biteAt((i / n) * BITE.every)
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThanOrEqual(1)
      if (v === 0) quiet++
      peak = Math.max(peak, v)
    }
    expect(quiet / n).toBeGreaterThan(0.8)
    expect(peak).toBeGreaterThan(0.95)
  })

  it('pulls the float under the surface while it tugs', () => {
    const t = BITE.every * (1 - BITE.lasts / 2)
    expect(stageAt(t).stage).toBe('wait')
    const f = fishingAt(COLS, ROWS, t)
    expect(f.floatY).toBeGreaterThan(interfaceAt(f.floatX, t, COLS, ROWS))
  })
})

describe('the big catch', () => {
  const span = CATCH.fight + CATCH.fly + CATCH.reel + CATCH.hold + CATCH.recast
  const during = (stage: Stage, from = 0, to = 1) => {
    const ts: number[] = []
    for (let t = 0; t < CATCH.every; t += 0.05) {
      const s = stageAt(t)
      if (s.stage === stage && s.p >= from && s.p <= to) ts.push(t)
    }
    return ts
  }

  it('plays every stage in order once a cycle, then waits', () => {
    expect(CATCH.start + span).toBeLessThanOrEqual(CATCH.every)
    const seen: Stage[] = []
    for (let t = 0; t < CATCH.every; t += 0.05) {
      const s = stageAt(t).stage
      if (seen[seen.length - 1] !== s) seen.push(s)
    }
    // The recast runs to the end of the cycle; the wait picks up at the start of the next one.
    expect(seen.slice(0, 6)).toEqual(['wait', 'fight', 'fly', 'reel', 'hold', 'recast'])
    expect(stageAt(CATCH.start + 1).stage).toBe(stageAt(CATCH.start + 1 + CATCH.every).stage)
  })

  it('no small nibbles while the big one is on', () => {
    for (const s of ['fight', 'fly', 'reel', 'hold', 'recast'] as const) {
      for (const t of during(s)) expect(biteAt(t)).toBe(0)
    }
  })

  it('fights back and forth: the rod tip pumps and he leans back to haul', () => {
    let lo = Number.POSITIVE_INFINITY
    let hi = Number.NEGATIVE_INFINITY
    let lean = 0
    for (const t of during('fight', 0, 0.85)) {
      const f = fishingAt(COLS, ROWS, t)
      lo = Math.min(lo, f.tipY)
      hi = Math.max(hi, f.tipY)
      lean = Math.max(lean, f.lean)
      expect(f.fish).not.toBeNull()
    }
    expect(hi - lo).toBeGreaterThan(3)
    expect(lean).toBeGreaterThan(0.5)
  })

  it('flings the fish high into the sky and onto the line', () => {
    let top = Number.POSITIVE_INFINITY
    for (const t of during('fly')) {
      const f = fishingAt(COLS, ROWS, t)
      expect(f.fish).not.toBeNull()
      top = Math.min(top, f.fish?.y ?? top)
    }
    expect(top).toBeLessThan(ROWS * 0.2)
    expect(top).toBeGreaterThan(0)
  })

  it('he takes the fish in hand, it goes in the crate, and the float goes back out', () => {
    const held = fishingAt(COLS, ROWS, during('hold', 0.2, 0.4)[0])
    expect(held.reach).not.toBeNull()
    const b = boatAt(COLS, ROWS, during('hold', 0.2, 0.4)[0])
    expect(Math.abs((held.fish?.x ?? 0) - b.x)).toBeLessThan(20 * BOAT_SCALE * (ROWS / 48))
    expect(fishingAt(COLS, ROWS, during('hold', 0.97)[0]).fish).toBeNull()
    expect(fishingAt(COLS, ROWS, during('recast', 0.95)[0]).fish).toBeNull()
    expect(fishingAt(COLS, ROWS, 2.4).fish).toBeNull()
  })
})

describe('gullsAt', () => {
  it('flocks come and go: the sky is sometimes empty and sometimes busy', () => {
    let empty = false
    let busy = 0
    for (let t = 0; t < 120; t += 0.5) {
      const gs = gullsAt(t, COLS, ROWS)
      if (gs.length === 0) empty = true
      busy = Math.max(busy, gs.length)
      for (const g of gs) {
        expect(g.y).toBeGreaterThan(0)
        expect(g.y).toBeLessThan(ROWS * 0.35)
      }
    }
    expect(empty).toBe(true)
    expect(busy).toBeGreaterThanOrEqual(Math.max(...FLOCKS.map((f) => f.birds.length)))
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

  it('fills the sea below the surface and draws a bright surface line', () => {
    const t = 2.4
    const f = compose(COLS, ROWS, t)
    expect(at(f, 20, ROWS - 1)).toBeGreaterThan(0.2)
    expect(at(f, 20, interfaceAt(20, t, COLS, ROWS))).toBeGreaterThan(0.9)
  })

  it('has the boat with a dark hull at the waterline and the float on the line', () => {
    const t = 2.4
    const f = compose(COLS, ROWS, t)
    const b = boatAt(COLS, ROWS, t)
    let hull = false
    for (let dc = -2; dc <= 2; dc++) if (at(f, b.x + dc, b.y - 1) > 0.7) hull = true
    expect(hull).toBe(true)
    const l = fishingAt(COLS, ROWS, t)
    expect(at(f, l.floatX, l.floatY)).toBe(1)
  })

  it('moves: the water, the boat, and the gulls change the picture over time', () => {
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
