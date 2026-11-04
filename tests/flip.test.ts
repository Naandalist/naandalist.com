import { describe, it, expect } from 'bun:test'
import { tiltFromPointer, nextFlip, isLinkTarget } from '../src/lib/flip'

const rect = { left: 100, top: 50, width: 400, height: 200 }

describe('tiltFromPointer', () => {
  it('is flat at the center', () => {
    const t = tiltFromPointer(300, 150, rect, 6)
    expect(Math.abs(t.rx)).toBeLessThan(0.01)
    expect(Math.abs(t.ry)).toBeLessThan(0.01)
  })
  it('tilts toward the pointer and never past the max', () => {
    const right = tiltFromPointer(500, 150, rect, 6)
    expect(right.ry).toBeCloseTo(6)
    const top = tiltFromPointer(300, 50, rect, 6)
    expect(top.rx).toBeCloseTo(6)
    const far = tiltFromPointer(5000, -5000, rect, 6)
    expect(Math.abs(far.ry)).toBeLessThanOrEqual(6)
    expect(Math.abs(far.rx)).toBeLessThanOrEqual(6)
  })
})

describe('nextFlip', () => {
  it('mouse: entering the top zone flips, leaving the card flips back', () => {
    expect(nextFlip({ event: 'zone-enter', flipped: false, pointer: 'mouse' })).toBe(true)
    expect(nextFlip({ event: 'card-leave', flipped: true, pointer: 'mouse' })).toBe(false)
  })
  it('touch: entering a zone does nothing, a tap toggles', () => {
    expect(nextFlip({ event: 'zone-enter', flipped: false, pointer: 'touch' })).toBe(false)
    expect(nextFlip({ event: 'zone-tap', flipped: false, pointer: 'touch' })).toBe(true)
    expect(nextFlip({ event: 'zone-tap', flipped: true, pointer: 'touch' })).toBe(false)
  })
  it('mouse tap on the zone does not undo a hover flip', () => {
    expect(nextFlip({ event: 'zone-tap', flipped: true, pointer: 'mouse' })).toBe(true)
  })
  it('the flip button always toggles, Escape always closes', () => {
    expect(nextFlip({ event: 'button', flipped: false, pointer: 'mouse' })).toBe(true)
    expect(nextFlip({ event: 'button', flipped: true, pointer: 'touch' })).toBe(false)
    expect(nextFlip({ event: 'escape', flipped: true, pointer: 'mouse' })).toBe(false)
  })
})

describe('isLinkTarget', () => {
  const el = (hit: boolean) => ({ closest: () => (hit ? {} : null) }) as unknown as Element
  it('treats links and buttons as not flippable', () => {
    expect(isLinkTarget(el(true))).toBe(true)
    expect(isLinkTarget(el(false))).toBe(false)
    expect(isLinkTarget(null)).toBe(false)
  })
})
