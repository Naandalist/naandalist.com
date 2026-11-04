import * as React from 'react'
import { createPortal } from 'react-dom'

interface TooltipProps {
  label: string
  children: React.ReactNode
  /** Controlled mode (e.g. keyboard navigation). Omit to open on hover and focus. */
  open?: boolean
  className?: string
}

const EDGE = 8
const GAP = 14

/** Pill tooltip rendered in a portal, so rotated or overflow-hidden parents never clip it. */
export function Tooltip({ label, children, open, className }: TooltipProps) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const [hover, setHover] = React.useState(false)
  const [pos, setPos] = React.useState<{ x: number; y: number } | null>(null)
  const pointerMode = React.useRef(false)
  const visible = open ?? hover

  // While the pointer drives the tooltip, a move anywhere outside the trigger closes it.
  // This catches fast sweeps and moving targets (marquee) where pointerleave never arrives.
  React.useEffect(() => {
    if (!hover) return
    const close = () => {
      pointerMode.current = false
      setHover(false)
    }
    const onMove = (e: PointerEvent) => {
      if (pointerMode.current && !ref.current?.contains(e.target as Node)) close()
    }
    document.addEventListener('pointermove', onMove)
    window.addEventListener('blur', close)
    document.addEventListener('scroll', close, { passive: true, capture: true })
    return () => {
      document.removeEventListener('pointermove', onMove)
      window.removeEventListener('blur', close)
      document.removeEventListener('scroll', close, { capture: true })
    }
  }, [hover])

  React.useLayoutEffect(() => {
    if (!visible || !ref.current) return setPos(null)
    // While the pointer drives the position it follows the cursor, so skip the element box.
    if (open === undefined && pointerMode.current) return
    const r = ref.current.getBoundingClientRect()
    setPos({ x: r.left + r.width / 2, y: r.top })
  }, [visible, label, open])

  return (
    <span
      ref={ref}
      className={className ?? 'inline-flex'}
      onPointerEnter={(e) => {
        if (e.pointerType === 'touch') return
        pointerMode.current = true
        setPos({ x: e.clientX, y: e.clientY })
        setHover(true)
      }}
      onPointerMove={(e) => {
        if (pointerMode.current) setPos({ x: e.clientX, y: e.clientY })
      }}
      onPointerLeave={() => {
        pointerMode.current = false
        setHover(false)
      }}
      onFocus={() => {
        if (!pointerMode.current) setHover(true)
      }}
      onBlur={() => setHover(false)}
    >
      {children}
      {visible &&
        pos &&
        createPortal(
          <span
            role="tooltip"
            ref={(el) => {
              // Keep the pill inside the viewport horizontally.
              if (!el) return
              const half = el.offsetWidth / 2
              const x = Math.min(Math.max(pos.x, half + EDGE), window.innerWidth - half - EDGE)
              el.style.left = `${x}px`
            }}
            className="pointer-events-none fixed z-50 whitespace-nowrap rounded-lg border border-border bg-background px-3 py-1 text-sm font-medium text-foreground shadow-2"
            style={
              open === undefined && pointerMode.current
                ? pos.y < 56
                  ? { left: pos.x, top: pos.y + GAP + 8, transform: 'translate(-50%, 0)' }
                  : { left: pos.x, top: pos.y - GAP, transform: 'translate(-50%, -100%)' }
                : { left: pos.x, top: pos.y - EDGE, transform: 'translate(-50%, -100%)' }
            }
          >
            {label}
          </span>,
          document.body,
        )}
    </span>
  )
}
