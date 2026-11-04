import { describe, expect, it } from 'bun:test'
import { memo, withTimeout } from '@/lib/memo'

describe('memo', () => {
  it('reuses the value within the ttl and calls once for concurrent callers', async () => {
    let calls = 0
    const load = () => memo('a', 1000, async () => (++calls, 'x'))
    const [a, b] = await Promise.all([load(), load()])
    expect([a, b, calls]).toEqual(['x', 'x', 1])
    expect(await load()).toBe('x')
    expect(calls).toBe(1)
  })

  it('refetches after the ttl', async () => {
    let calls = 0
    const load = () => memo('b', 5, async () => ++calls)
    await load()
    await new Promise((r) => setTimeout(r, 20))
    await load()
    expect(calls).toBe(2)
  })

  it('does not cache failures', async () => {
    let calls = 0
    const load = () => memo('c', 1000, async () => { if (++calls === 1) throw new Error('boom'); return 'ok' })
    await expect(load()).rejects.toThrow('boom')
    expect(await load()).toBe('ok')
  })
})

describe('withTimeout', () => {
  it('returns the fallback when the work is too slow', async () => {
    expect(await withTimeout(new Promise((r) => setTimeout(() => r('late'), 100)), 10, 'fallback')).toBe('fallback')
  })
  it('returns the value when it is fast enough', async () => {
    expect(await withTimeout(Promise.resolve('fast'), 50, 'fallback')).toBe('fast')
  })
})
