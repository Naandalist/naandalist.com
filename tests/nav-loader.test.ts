import { describe, expect, it } from 'bun:test'
import { createNavLoader } from '@/lib/nav-loader'

/** A manual clock so the tests do not wait for real time. */
function setup(options: { delay?: number; minVisible?: number } = {}) {
  let now = 0
  const timers: { id: number; at: number; fn: () => void }[] = []
  let nextId = 1
  const log: string[] = []
  const loader = createNavLoader({
    show: () => log.push('show'),
    hide: () => log.push('hide'),
    now: () => now,
    setTimer: (fn, ms) => (timers.push({ id: nextId, at: now + ms, fn }), nextId++),
    clearTimer: (id) => {
      const i = timers.findIndex((t) => t.id === id)
      if (i >= 0) timers.splice(i, 1)
    },
    ...options,
  })
  const advance = (ms: number) => {
    const end = now + ms
    for (;;) {
      timers.sort((a, b) => a.at - b.at)
      const next = timers.find((t) => t.at <= end)
      if (!next) break
      timers.splice(timers.indexOf(next), 1)
      now = next.at
      next.fn()
    }
    now = end
  }
  return { loader, advance, log }
}

describe('createNavLoader', () => {
  it('never shows for a fast navigation', () => {
    const { loader, advance, log } = setup({ delay: 150 })
    loader.start()
    advance(100)
    loader.done()
    advance(1000)
    expect(log).toEqual([])
  })

  it('shows after the delay and hides when done, once it has been visible long enough', () => {
    const { loader, advance, log } = setup({ delay: 150, minVisible: 400 })
    loader.start()
    advance(150)
    expect(log).toEqual(['show'])
    advance(100)
    loader.done()
    expect(log).toEqual(['show'])
    advance(299)
    expect(log).toEqual(['show'])
    advance(1)
    expect(log).toEqual(['show', 'hide'])
  })

  it('hides at once when it has already been visible long enough', () => {
    const { loader, advance, log } = setup({ delay: 150, minVisible: 400 })
    loader.start()
    advance(150 + 500)
    loader.done()
    expect(log).toEqual(['show', 'hide'])
  })

  it('a new navigation while visible keeps it visible and cancels the pending hide', () => {
    const { loader, advance, log } = setup({ delay: 150, minVisible: 400 })
    loader.start()
    advance(160)
    loader.done()
    loader.start()
    advance(2000)
    expect(log).toEqual(['show'])
    loader.done()
    advance(1000)
    expect(log).toEqual(['show', 'hide'])
  })

  it('done without a start does nothing', () => {
    const { loader, advance, log } = setup()
    loader.done()
    advance(1000)
    expect(log).toEqual([])
  })
})
