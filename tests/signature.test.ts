import { describe, it, expect } from 'bun:test'
import { SIGNATURE } from '../src/lib/signature-path'

describe('naandalist signature', () => {
  it('has a path, a viewBox, and a draw duration', () => {
    expect(SIGNATURE.d.startsWith('M')).toBe(true)
    expect(SIGNATURE.d.length).toBeGreaterThan(80)
    expect(SIGNATURE.width).toBeGreaterThan(0)
    expect(SIGNATURE.height).toBeGreaterThan(0)
  })

  it('has one outline per letter of naandalist', () => {
    // r a i h a n p k = 8 letters. i adds a dot and a, p add counters, so at least 8 subpaths.
    expect((SIGNATURE.d.match(/M/g) ?? []).length).toBeGreaterThanOrEqual(8)
  })

  it('has no NaN or Infinity in the path', () => {
    expect(SIGNATURE.d).not.toMatch(/NaN|Infinity/)
  })

  it('is wide, like a word, not a monogram', () => {
    expect(SIGNATURE.width / SIGNATURE.height).toBeGreaterThan(3)
  })

  it('stays inside its own viewBox', () => {
    // Absolute commands only. H and V carry one number, the others carry x y pairs.
    const xs: number[] = []
    const ys: number[] = []
    for (const [, cmd, args] of SIGNATURE.d.matchAll(/([MLQCHVZ])([^MLQCHVZ]*)/g)) {
      const n = (args.match(/-?\d+(\.\d+)?/g) ?? []).map(Number)
      if (cmd === 'H') xs.push(...n)
      else if (cmd === 'V') ys.push(...n)
      else
        n.forEach((v, i) => {
          ;(i % 2 === 0 ? xs : ys).push(v)
        })
    }
    expect(Math.min(...xs)).toBeGreaterThanOrEqual(-1)
    expect(Math.max(...xs)).toBeLessThanOrEqual(SIGNATURE.width + 1)
    expect(Math.min(...ys)).toBeGreaterThanOrEqual(-1)
    expect(Math.max(...ys)).toBeLessThanOrEqual(SIGNATURE.height + 1)
  })

  it('does not pull a font parser into the app code', async () => {
    const { Glob } = await import('bun')
    for await (const f of new Glob('src/**/*.{ts,tsx,astro}').scan('.')) {
      expect(await Bun.file(f).text()).not.toContain('opentype')
    }
  })
})

describe('signature in the header', () => {
  const read = (p: string) => Bun.file(p).text()

  it('replaces the title text with an accessible signature link', async () => {
    const header = await read('src/components/Header.astro')
    expect(header).toContain('Signature')
    expect(header).toContain('aria-label="naandalist"')
  })

  it('draws on every full page load, and respects reduced motion', async () => {
    expect(await read('src/components/Head.astro')).toContain("dataset.sign")
    const css = await read('src/styles/global.css')
    expect(css).toMatch(/html\[data-sign\]\s+\.signature/)
    expect(css).toMatch(/prefers-reduced-motion[^}]*\{[^}]*\.signature/s)
  })
})
