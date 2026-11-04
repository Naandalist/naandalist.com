/** Pure rules for the profile card: how far it tilts, and when it flips. */

export interface RectLike {
  left: number
  top: number
  width: number
  height: number
}

/** Tilt in degrees toward the pointer, capped at maxDeg. Keep maxDeg small so it never feels shaky. */
export function tiltFromPointer(px: number, py: number, rect: RectLike, maxDeg: number) {
  const nx = Math.max(-1, Math.min(1, ((px - rect.left) / rect.width - 0.5) * 2))
  const ny = Math.max(-1, Math.min(1, ((py - rect.top) / rect.height - 0.5) * 2))
  return { rx: -ny * maxDeg, ry: nx * maxDeg }
}

export type FlipEvent = 'zone-enter' | 'zone-tap' | 'card-leave' | 'button' | 'escape'

/**
 * Next flipped state.
 * - Mouse: hovering the top zone flips, leaving the card flips back. A click in the zone keeps the state.
 * - Touch: there is no hover, so a tap in the zone toggles.
 * - The flip button and Escape work for everyone, keyboard included.
 */
export function nextFlip({ event, flipped, pointer }: { event: FlipEvent; flipped: boolean; pointer: 'mouse' | 'touch' }) {
  switch (event) {
    case 'zone-enter':
      return pointer === 'mouse' ? true : flipped
    case 'zone-tap':
      return pointer === 'touch' ? !flipped : flipped
    case 'card-leave':
      return pointer === 'mouse' ? false : flipped
    case 'button':
      return !flipped
    case 'escape':
      return false
  }
}

/** Links and buttons keep their own click, so they never trigger a flip. */
export function isLinkTarget(target: Element | null): boolean {
  return !!target && typeof target.closest === 'function' && !!target.closest('a, button, input, [data-no-flip]')
}
