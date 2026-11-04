import { describe, it, expect } from 'bun:test'
import { bayer4 } from '../src/lib/bayer'

describe('bayer4', () => {
  it('covers 16 distinct thresholds strictly between 0 and 1', () => {
    const seen = new Set<number>()
    for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) seen.add(bayer4(x, y))
    expect(seen.size).toBe(16)
    for (const v of seen) {
      expect(v).toBeGreaterThan(0)
      expect(v).toBeLessThan(1)
    }
  })
  it('tiles every 4 cells and accepts negative coordinates', () => {
    expect(bayer4(5, 9)).toBe(bayer4(1, 1))
    expect(bayer4(-1, -1)).toBe(bayer4(3, 3))
  })
})
