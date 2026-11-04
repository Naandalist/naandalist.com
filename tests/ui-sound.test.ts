import { describe, it, expect } from 'bun:test'
import { createUiSound, shouldPlay } from '../src/lib/ui-sound'

function fakeStorage(initial: Record<string, string> = {}) {
  const map = new Map(Object.entries(initial))
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
  }
}

function fakeContext() {
  const calls: string[] = []
  const node = (name: string) => ({
    connect: () => node(name),
    start: () => calls.push(`${name}.start`),
    stop: () => calls.push(`${name}.stop`),
    frequency: { setValueAtTime: () => {} },
    gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} },
    type: '',
    buffer: null,
    Q: { value: 0 },
  })
  const ctx = {
    state: 'suspended' as 'suspended' | 'running',
    currentTime: 0,
    sampleRate: 48000,
    destination: {},
    resume: () => {
      calls.push('resume')
      ctx.state = 'running'
      return Promise.resolve()
    },
    createBuffer: (_c: number, n: number) => ({ getChannelData: () => new Float32Array(n) }),
    createBufferSource: () => node('noise'),
    createBiquadFilter: () => node('filter'),
    createGain: () => node('gain'),
    createOscillator: () => node('osc'),
  }
  return { ctx, calls }
}

describe('ui sound', () => {
  it('stores the mute choice and reads it back', () => {
    const storage = fakeStorage()
    const a = createUiSound({ storage, createContext: () => null })
    expect(a.isMuted()).toBe(false)
    a.setMuted(true)
    const b = createUiSound({ storage, createContext: () => null })
    expect(b.isMuted()).toBe(true)
  })

  it('does not create an audio context when muted', () => {
    let created = 0
    const s = createUiSound({
      storage: fakeStorage({ 'ui-sound-muted': '1' }),
      createContext: () => (created++, null),
    })
    expect(s.play()).toBe(false)
    expect(created).toBe(0)
  })

  it('does not throw when audio is unavailable', () => {
    const s = createUiSound({ storage: fakeStorage(), createContext: () => null })
    expect(s.play()).toBe(false)
    const boom = createUiSound({
      storage: fakeStorage(),
      createContext: () => {
        throw new Error('no audio')
      },
    })
    expect(boom.play()).toBe(false)
  })

  it('creates the context lazily, once, and resumes it', () => {
    const { ctx, calls } = fakeContext()
    let created = 0
    const s = createUiSound({
      storage: fakeStorage(),
      createContext: () => (created++, ctx as never),
      now: () => 1000,
    })
    expect(created).toBe(0)
    expect(s.play()).toBe(true)
    expect(created).toBe(1)
    expect(calls).toContain('resume')
    expect(calls).toContain('noise.start')
    expect(calls).toContain('osc.start')
  })

  it('ignores plays that come faster than the gap', () => {
    const { ctx } = fakeContext()
    let t = 1000
    const s = createUiSound({ storage: fakeStorage(), createContext: () => ctx as never, now: () => t })
    expect(s.play()).toBe(true)
    t += 10
    expect(s.play()).toBe(false)
    t += 100
    expect(s.play()).toBe(true)
  })

  it('survives broken storage', () => {
    const s = createUiSound({
      storage: {
        getItem: () => {
          throw new Error('blocked')
        },
        setItem: () => {
          throw new Error('blocked')
        },
      },
      createContext: () => null,
    })
    expect(s.isMuted()).toBe(false)
    expect(() => s.setMuted(true)).not.toThrow()
  })
})

describe('shouldPlay', () => {
  const el = (opts: { match?: boolean; disabled?: boolean; ariaDisabled?: boolean; optOut?: boolean }) =>
    ({
      closest: (sel: string) => {
        if (sel === '[data-no-sound]') return opts.optOut ? {} : null
        return opts.match
          ? {
              hasAttribute: (n: string) => n === 'disabled' && !!opts.disabled,
              getAttribute: (n: string) => (n === 'aria-disabled' && opts.ariaDisabled ? 'true' : null),
            }
          : null
      },
    }) as unknown as Element

  it('plays for interactive elements', () => {
    expect(shouldPlay(el({ match: true }))).toBe(true)
  })
  it('skips plain content', () => {
    expect(shouldPlay(el({ match: false }))).toBe(false)
  })
  it('skips disabled controls and opt-outs', () => {
    expect(shouldPlay(el({ match: true, disabled: true }))).toBe(false)
    expect(shouldPlay(el({ match: true, ariaDisabled: true }))).toBe(false)
    expect(shouldPlay(el({ match: true, optOut: true }))).toBe(false)
  })
  it('skips non-elements', () => {
    expect(shouldPlay(null)).toBe(false)
  })
})
