import { describe, it, expect } from 'bun:test'
import { burstCount, burstLeafAt, compose, cycleOf, gustAt, groundField, hikersAt, progressAt, ridgeY } from '../src/lib/hike'

const SIZES = [
  [150, 40],
  [170, 40],
  [288, 48],
  [400, 48],
] as const

const times = (cols: number, rows: number, n = 600) => Array.from({ length: n }, (_, i) => (i / n) * cycleOf(cols, rows))

describe('the trail', () => {
  it('rises from the left edge to the right edge, with no flat or downhill stretch', () => {
    for (const [cols, rows] of SIZES) {
      const k = rows / 48
      expect(ridgeY(cols, rows, 0) - ridgeY(cols, rows, cols - 1)).toBeGreaterThan(27 * k)
      for (let x = 1; x < cols; x++) expect(ridgeY(cols, rows, x)).toBeLessThan(ridgeY(cols, rows, x - 1))
    }
  })

  it('is steep in places: pitches well above its average, with easier stretches between', () => {
    for (const [cols, rows] of SIZES) {
      const slopes = Array.from({ length: cols - 2 }, (_, i) => (ridgeY(cols, rows, i) - ridgeY(cols, rows, i + 2)) / 2)
      const mean = slopes.reduce((a, b) => a + b, 0) / slopes.length
      expect(Math.max(...slopes)).toBeGreaterThan(mean * 1.6)
      expect(Math.min(...slopes)).toBeLessThan(mean * 0.4)
    }
  })
})

describe('the frame', () => {
  it('stays within 0..1, finite, and has ink at every size', () => {
    for (const [cols, rows] of SIZES) {
      for (const f of [0, 0.1, 0.37, 0.6, 0.9]) {
        const frame = compose(cols, rows, f * cycleOf(cols, rows))
        expect(frame.length).toBe(cols * rows)
        let ink = 0
        for (const v of frame) {
          expect(Number.isFinite(v)).toBe(true)
          expect(v).toBeGreaterThanOrEqual(0)
          expect(v).toBeLessThanOrEqual(1)
          if (v > 0) ink++
        }
        expect(ink).toBeGreaterThan(cols)
      }
    }
  })

  it('loops with no seam: a lap later is the same picture', () => {
    for (const [cols, rows] of SIZES) {
      const cycle = cycleOf(cols, rows)
      for (const t of [1.3, cycle * 0.4, cycle * 0.93, cycle * 0.22, cycle * 0.7]) {
        const a = compose(cols, rows, t)
        const b = compose(cols, rows, t + cycle)
        let diff = 0
        for (let i = 0; i < a.length; i++) if (Math.abs(a[i] - b[i]) > 1e-3) diff++
        expect(diff).toBeLessThan(4)
      }
    }
  })

  it('reuses a precomputed ground', () => {
    expect(compose(288, 48, 3, groundField(288, 48))).toEqual(compose(288, 48, 3))
  })
})

describe('the hikers', () => {
  it('are three, in a line from one side of the band to the other', () => {
    for (const [cols, rows] of SIZES) {
      for (const t of times(cols, rows)) {
        const xs = hikersAt(t, cols, rows).map((h) => h.x)
        expect(xs.length).toBe(3)
        expect(Math.min(...xs)).toBeLessThan(cols * 0.5)
        expect(Math.max(...xs)).toBeGreaterThan(cols * 0.5)
      }
    }
  })

  it('each cross the band left to right once a lap, and wrap round off screen', () => {
    for (const [cols, rows] of SIZES) {
      const cycle = cycleOf(cols, rows)
      const k = rows / 48
      for (let i = 0; i < 3; i++) {
        let prev = hikersAt(0, cols, rows)[i].x
        let wraps = 0
        for (let n = 1; n <= 1200; n++) {
          const x = hikersAt((n / 1200) * cycle, cols, rows)[i].x
          if (x < prev) {
            wraps++
            // The wrap happens well out of sight.
            expect(prev).toBeGreaterThan(cols + 10 * k)
            expect(x).toBeLessThan(-10 * k)
          } else expect(x - prev).toBeLessThan(2 * k)
          prev = x
        }
        expect(wraps).toBeLessThanOrEqual(1)
      }
    }
  })

  it('slow down on the steep pitches', () => {
    for (const [cols, rows] of SIZES) {
      const dt = 0.05
      const speeds = Array.from({ length: 300 }, (_, i) => {
        const a = hikersAt(0.6 * cycleOf(cols, rows) + i * dt, cols, rows)[1]
        const b = hikersAt(0.6 * cycleOf(cols, rows) + i * dt + dt, cols, rows)[1]
        const steep = (ridgeY(cols, rows, a.x - 1) - ridgeY(cols, rows, a.x + 1)) / 2
        return { steep, v: (b.x - a.x) / dt }
      }).filter((s) => s.v > 0)
      const steepest = speeds.reduce((m, s) => (s.steep > m.steep ? s : m))
      const easiest = speeds.reduce((m, s) => (s.steep < m.steep ? s : m))
      expect(steepest.v).toBeLessThan(easiest.v)
    }
  })

  it('stand on the trail and stay in the band', () => {
    for (const [cols, rows] of SIZES) {
      for (const t of times(cols, rows)) {
        for (const h of hikersAt(t, cols, rows)) {
          const gaps = h.feet.map(([x, y]) => ridgeY(cols, rows, x) - y)
          // Never sunk into the trail, and the lower foot rests on it.
          expect(Math.min(...gaps)).toBeGreaterThan(-0.01)
          expect(Math.min(...gaps)).toBeLessThan(0.01)
          if (h.x > 2 && h.x < cols - 2) expect(h.head[1]).toBeGreaterThan(0)
        }
      }
    }
  })
})

describe('the wind', () => {
  it('is calm most of the time and comes in twice a lap, slamming in within a second', () => {
    for (const [cols, rows] of SIZES) {
      const cycle = cycleOf(cols, rows)
      let blowing = 0
      let onsets = 0
      let was = 0
      let peak = 0
      const n = 4000
      for (let i = 0; i < n; i++) {
        const st = gustAt((i / n) * cycle, cols, rows)?.strength ?? 0
        if (st > 0.05) blowing++
        if (st > 0.05 && was <= 0.05) onsets++
        peak = Math.max(peak, st)
        was = st
      }
      expect(onsets).toBe(2)
      expect(peak).toBeGreaterThan(0.99)
      expect(blowing / n).toBeLessThan(0.3)
      expect(blowing / n).toBeGreaterThan(0.1)
    }
    const g = gustAt(0.2 * cycleOf(288, 48) + 0.7, 288, 48)
    expect(g?.strength).toBeGreaterThan(0.95)
  })

  it('tears a flurry of leaves loose that race across to the left, and none while calm', () => {
    for (const [cols, rows] of SIZES) {
      const cycle = cycleOf(cols, rows)
      const peak = 0.2 * cycle + 2.5
      const flying = Array.from({ length: burstCount(cols) }, (_, j) => burstLeafAt(j, peak, cols, rows)).filter((l) => l)
      expect(flying.length).toBeGreaterThan(burstCount(cols) * 0.4)
      for (const l of flying) {
        expect(l?.y).toBeGreaterThanOrEqual(0)
        expect(l?.y).toBeLessThan(rows)
      }
      // They only ever move left.
      for (let j = 0; j < burstCount(cols); j++) {
        let prev = Infinity
        for (let t = 0.2 * cycle; t < 0.2 * cycle + 10; t += 0.05) {
          const l = burstLeafAt(j, t, cols, rows)
          if (l) {
            expect(l.x).toBeLessThanOrEqual(prev)
            prev = l.x
          }
        }
      }
      const calm = 0.5 * cycle
      for (let j = 0; j < burstCount(cols); j++) expect(burstLeafAt(j, calm, cols, rows)).toBeNull()
    }
  })

  it('puts more ink in the air at the height of a gust than in calm', () => {
    const [cols, rows] = [288, 48]
    const cycle = cycleOf(cols, rows)
    const sky = (t: number) => {
      const f = compose(cols, rows, t)
      let ink = 0
      for (let y = 0; y < rows * 0.4; y++) for (let x = 0; x < cols; x++) ink += f[y * cols + x]
      return ink
    }
    expect(sky(0.2 * cycle + 2.5)).toBeGreaterThan(sky(0.5 * cycle) * 1.15)
  })
})

describe('the wind against the hikers', () => {
  it('holds them back in a gust, and the loop still closes exactly', () => {
    for (const [cols, rows] of SIZES) {
      const cycle = cycleOf(cols, rows)
      const rate = (t: number) => (progressAt(t + 0.05, cols, rows) - progressAt(t, cols, rows)) / 0.05
      const peak = rate(0.2 * cycle + 2.5)
      const calm = rate(0.5 * cycle)
      // Headway at the height of a gust is under half of what it is in calm, and calm is a little faster than 1/cycle.
      expect(peak).toBeLessThan(calm * 0.5)
      expect(calm).toBeGreaterThan(1 / cycle)
      // Always moving forward.
      for (let i = 0; i < 2000; i++) expect(rate((i / 2000) * cycle)).toBeGreaterThan(0)
      // A lap is exactly one lap.
      for (const t of [0, 3.1, cycle * 0.27, cycle * 0.9]) {
        expect(progressAt(t + cycle, cols, rows)).toBeCloseTo(progressAt(t, cols, rows) + 1, 4)
      }
    }
  })
})
