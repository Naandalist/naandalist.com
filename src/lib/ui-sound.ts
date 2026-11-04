/**
 * Soft click sound for presses and taps, synthesized with Web Audio (no audio file).
 * A 20ms band-passed noise tick plus a very short low thump, kept quiet on purpose.
 * The AudioContext is created on the first press, which is a user gesture, so
 * browsers allow it. The mute choice is saved in localStorage.
 */

const STORAGE_KEY = 'ui-sound-muted'
const MIN_GAP_MS = 40

export const INTERACTIVE_SELECTOR = [
  'a[href]',
  'button',
  'summary',
  '[role="button"]',
  '[role="tab"]',
  '[role="menuitem"]',
  'input[type="submit"]',
  'input[type="button"]',
  'input[type="checkbox"]',
  'input[type="radio"]',
  'label[for]',
].join(',')

export function shouldPlay(target: Element | null): boolean {
  if (!target || typeof target.closest !== 'function') return false
  if (target.closest('[data-no-sound]')) return false
  const control = target.closest(INTERACTIVE_SELECTOR)
  if (!control) return false
  if (control.hasAttribute('disabled')) return false
  if (control.getAttribute('aria-disabled') === 'true') return false
  return true
}

interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export interface UiSound {
  isMuted(): boolean
  setMuted(muted: boolean): void
  /** Returns true when a tick was scheduled. */
  play(): boolean
}

interface Options {
  storage: StorageLike
  createContext: () => AudioContext | null
  now?: () => number
}

function tick(ctx: AudioContext) {
  const t = ctx.currentTime

  const length = Math.max(1, Math.floor(ctx.sampleRate * 0.02))
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3)

  const noise = ctx.createBufferSource()
  noise.buffer = buffer
  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.setValueAtTime(2400, t)
  filter.Q.value = 0.9
  const noiseGain = ctx.createGain()
  noiseGain.gain.setValueAtTime(0.07, t)
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.02)
  noise.connect(filter)
  filter.connect(noiseGain)
  noiseGain.connect(ctx.destination)
  noise.start(t)

  const osc = ctx.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(190, t)
  const oscGain = ctx.createGain()
  oscGain.gain.setValueAtTime(0.05, t)
  oscGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.03)
  osc.connect(oscGain)
  oscGain.connect(ctx.destination)
  osc.start(t)
  osc.stop(t + 0.04)
}

export function createUiSound({ storage, createContext, now = Date.now }: Options): UiSound {
  let ctx: AudioContext | null = null
  let failed = false
  let lastPlay = -Infinity

  const readMuted = () => {
    try {
      return storage.getItem(STORAGE_KEY) === '1'
    } catch {
      return false
    }
  }
  let muted = readMuted()

  return {
    isMuted: () => muted,
    setMuted(next) {
      muted = next
      try {
        storage.setItem(STORAGE_KEY, next ? '1' : '0')
      } catch {
        // Storage can be blocked. The choice then lasts for this page only.
      }
    },
    play() {
      if (muted || failed) return false
      const t = now()
      if (t - lastPlay < MIN_GAP_MS) return false
      try {
        ctx ??= createContext()
        if (!ctx) {
          failed = true
          return false
        }
        if (ctx.state === 'suspended') void ctx.resume().catch(() => {})
        tick(ctx)
        lastPlay = t
        return true
      } catch {
        failed = true
        return false
      }
    },
  }
}

type SoundWindow = Window & { __uiSound?: UiSound; webkitAudioContext?: typeof AudioContext }

/** Browser entry point. Safe to call many times: listeners are attached once per page load. */
export function initUiSound(): UiSound {
  const w = window as SoundWindow
  if (w.__uiSound) return w.__uiSound

  const sound = createUiSound({
    storage: window.localStorage,
    createContext: () => {
      const Ctor = window.AudioContext ?? w.webkitAudioContext
      return Ctor ? new Ctor() : null
    },
  })

  document.addEventListener(
    'pointerdown',
    (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return
      if (shouldPlay(e.target as Element | null)) sound.play()
    },
    { capture: true, passive: true },
  )
  // Enter and Space on a focused control, since those do not fire pointerdown.
  document.addEventListener(
    'keydown',
    (e) => {
      if (e.repeat || (e.key !== 'Enter' && e.key !== ' ')) return
      if (shouldPlay(e.target as Element | null)) sound.play()
    },
    true,
  )

  w.__uiSound = sound
  return sound
}
