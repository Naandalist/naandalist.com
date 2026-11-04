/**
 * Hover and focus tooltip for text links: shows where the link goes, or its title.
 * One shared element, positioned above the link, same look as ui/Tooltip.
 * Opt out per link with data-no-tip.
 */

const EDGE = 8
const GAP = 14

export function describeLink(a: HTMLAnchorElement, origin = location.origin): string {
  const named = a.getAttribute('title') || a.getAttribute('aria-label')
  if (named) return named
  const href = a.getAttribute('href') ?? ''
  if (href.startsWith('mailto:')) return href.slice(7)
  try {
    const url = new URL(a.href, origin)
    if (url.origin === origin) return url.pathname + url.search + url.hash
    return (url.host + url.pathname + url.search + url.hash).replace(/\/$/, '')
  } catch {
    return href
  }
}

/** A text link: has visible text, no opt-out, and is not a card wrapping blocks or images. */
export function isTextLink(a: HTMLAnchorElement): boolean {
  if (a.getAttribute('data-no-tip') !== null) return false
  if (!a.textContent?.trim()) return false
  return !a.querySelector('img,h1,h2,h3,h4,p,div')
}

export function initLinkTooltip() {
  let tip: HTMLElement | null = null
  let current: Element | null = null

  const hide = () => {
    current = null
    tip?.remove()
  }

  /** Put the tooltip at a point: above it, or below when there is no room. Clamped to the viewport. */
  const place = (x: number, y: number, gap: number) => {
    if (!tip) return
    const half = tip.offsetWidth / 2
    tip.style.left = `${Math.min(Math.max(x, half + EDGE), window.innerWidth - half - EDGE)}px`
    const above = y - gap > tip.offsetHeight + EDGE
    tip.style.top = `${above ? y - gap : y + gap}px`
    tip.style.transform = above ? 'translate(-50%, -100%)' : 'translate(-50%, 0)'
  }

  // pointer: follow the cursor. Without one (keyboard focus) sit above the link.
  const show = (a: HTMLAnchorElement, pointer?: { x: number; y: number }) => {
    if (current !== a) {
      current = a
      // A view-transition swap can detach the element, so create it on demand.
      tip ??= document.createElement('span')
      tip.setAttribute('role', 'tooltip')
      tip.className =
        'pointer-events-none fixed z-50 whitespace-nowrap rounded-lg border border-border bg-background px-3 py-1 text-sm font-medium text-foreground shadow-2'
      tip.textContent = describeLink(a)
      document.body.append(tip)
    }
    if (pointer) place(pointer.x, pointer.y, GAP)
    else {
      const r = a.getBoundingClientRect()
      place(r.left + r.width / 2, r.top, EDGE)
    }
  }

  const target = (e: Event) => {
    const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null
    return a && a.closest('main, footer') && isTextLink(a) ? a : null
  }

  document.addEventListener('pointerover', (e) => {
    if ((e as PointerEvent).pointerType === 'touch') return
    const a = target(e)
    if (a) show(a, { x: (e as PointerEvent).clientX, y: (e as PointerEvent).clientY })
  })
  // The move handler is the source of truth: if the pointer is not over a text link, hide.
  // This also catches fast sweeps where a pointerout never reached us.
  document.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return
    const a = target(e)
    if (a) show(a, { x: e.clientX, y: e.clientY })
    else if (current) hide()
  })
  document.addEventListener('pointerout', (e) => {
    if (target(e)) hide()
  })
  document.documentElement.addEventListener('pointerleave', hide)
  window.addEventListener('blur', hide)
  document.addEventListener('visibilitychange', hide)
  document.addEventListener('focusin', (e) => {
    const a = target(e)
    if (a) show(a)
  })
  document.addEventListener('focusout', hide)
  document.addEventListener('scroll', hide, { passive: true })
  document.addEventListener('astro:before-swap', hide)
}
