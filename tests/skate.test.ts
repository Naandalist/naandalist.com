import { describe, it, expect } from 'bun:test'
import { CYCLE, beats, blocks, compose, figureAt, groundField, groundRow, rigOf } from '../src/lib/skate'

const SIZES = [
  [150, 40],
  [170, 40],
  [288, 48],
  [400, 48],
] as const

const times = (n = 900) => Array.from({ length: n }, (_, i) => (i / n) * CYCLE)

describe('the frame', () => {
  it('stays within 0..1, finite, and has ink at every size', () => {
    for (const [cols, rows] of SIZES) {
      for (const t of [0, 2.4, 4, 6, 8, 9.5]) {
        const f = compose(cols, rows, t)
        expect(f.length).toBe(cols * rows)
        let ink = 0
        for (const v of f) {
          expect(Number.isFinite(v)).toBe(true)
          expect(v).toBeGreaterThanOrEqual(0)
          expect(v).toBeLessThanOrEqual(1)
          if (v > 0) ink++
        }
        expect(ink).toBeGreaterThan(cols)
      }
    }
  })

  it('loops: a lap later is the same picture', () => {
    for (const t of [1.3, 4.4, 7.1]) {
      const a = compose(288, 48, t)
      const b = compose(288, 48, t + CYCLE)
      let diff = 0
      for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) diff++
      expect(diff).toBeLessThan(3)
    }
  })

  it('reuses a precomputed ground', () => {
    expect(compose(288, 48, 3, groundField(288, 48))).toEqual(compose(288, 48, 3))
  })

  it('has a pit with no ground line in it', () => {
    for (const [cols, rows] of SIZES) {
      const { pit } = blocks(cols, rows)
      const f = groundField(cols, rows)
      const mid = Math.round(pit.x + pit.w / 2)
      const g = Math.round(groundRow(rows))
      expect(f[g * cols + mid]).toBe(0)
      expect(f[(g + 1) * cols + mid]).toBeGreaterThan(0)
    }
  })
})

describe('the skater', () => {
  it('enters from the left edge and leaves past the right edge, always moving forward', () => {
    for (const [cols, rows] of SIZES) {
      const xs = times().map((t) => figureAt(t, cols, rows)?.x).filter((x): x is number => x !== undefined)
      expect(xs[0]).toBeLessThan(0)
      expect(xs[xs.length - 1]).toBeGreaterThan(cols)
      for (let i = 1; i < xs.length; i++) expect(xs[i]).toBeGreaterThanOrEqual(xs[i - 1])
    }
  })

  it('is out of frame during the pause, so the lap restarts cleanly', () => {
    expect(figureAt(CYCLE - 0.1, 288, 48)).toBeNull()
  })

  it('never sinks below the ground, and stays inside the band', () => {
    for (const [cols, rows] of SIZES) {
      const g = groundRow(rows)
      for (const t of times()) {
        const fig = figureAt(t, cols, rows)
        if (!fig) continue
        const r = rigOf(fig, rows)
        const all = [...r.deck, ...r.wheels, r.hip, r.shoulder, r.head, ...r.knees, ...r.feet, ...r.elbows, ...r.hands]
        for (const [, y] of all) {
          expect(y).toBeLessThanOrEqual(g + 0.5)
          expect(y).toBeGreaterThanOrEqual(0)
        }
      }
    }
  })

  it('clears the cones, the ledge and the kicker: the upper body stays above them', () => {
    for (const [cols, rows] of SIZES) {
      const g = groundRow(rows)
      const k = rows / 48
      const { cones, rail, kicker } = blocks(cols, rows)
      const top = (x: number) => {
        if (x > cones.x && x < cones.x + cones.w) return cones.h
        if (x > rail.x && x < rail.x + rail.w) return rail.h
        if (x > kicker.x && x < kicker.x + kicker.w) return kicker.h * ((x - kicker.x) / kicker.w)
        return 0
      }
      for (const t of times(1800)) {
        const fig = figureAt(t, cols, rows)
        if (!fig) continue
        const r = rigOf(fig, rows)
        for (const [x, y] of [r.hip, r.shoulder, r.head, ...r.hands]) expect(g - y).toBeGreaterThanOrEqual(top(x) + 1.5 * k)
      }
    }
  })

  it('clears the pit in the air', () => {
    for (const [cols, rows] of SIZES) {
      const { pit } = blocks(cols, rows)
      for (const t of times(1800)) {
        const fig = figureAt(t, cols, rows)
        if (!fig) continue
        const r = rigOf(fig, rows)
        // Both wheels are above the pit: nothing rides across the gap.
        for (const [x, y] of r.wheels) {
          if (x > pit.x + 0.5 && x < pit.x + pit.w - 0.5) expect(groundRow(rows) - y).toBeGreaterThan(2)
        }
      }
    }
  })

  it('spins the board a full flip, a half shove-it, and the body a full turn', () => {
    const { list } = beats(288, 48)
    const at = (kind: string, f: number) => {
      const b = list.find((it) => it.kind === kind)
      if (!b) throw new Error(kind)
      return figureAt(b.t0 + b.dur * f, 288, 48)
    }
    expect(at('kickflip', 0.999)?.flip).toBeCloseTo(Math.PI * 2, 1)
    expect(at('kickflip', 0.5)?.flip).toBeGreaterThan(1)
    expect(at('shuvit', 0.999)?.shuv).toBeCloseTo(Math.PI, 1)
    expect(at('air', 0.999)?.spin).toBeCloseTo(Math.PI * 2, 1)
    expect(at('ride', 0.5)?.flip).toBe(0)
  })
})
