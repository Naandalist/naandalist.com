import { useRef } from 'react'
import { useBabysBreath, type Scene } from '@/hooks/useBabysBreath'
import { cn } from '@/lib/utils'

/** Decorative dithered plant band (baby's breath or dandelion). Hidden from assistive tech. */
export default function BabysBreathField({
  className,
  animate = true,
  perspective,
  scene,
  cell,
}: {
  className?: string
  animate?: boolean
  perspective?: number
  scene?: Scene
  cell?: number
}) {
  const ref = useRef<HTMLCanvasElement>(null)
  useBabysBreath(ref, { animate, perspective, scene, cell })
  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{ opacity: 0 }}
      className={cn('pointer-events-none transition-opacity duration-700', className)}
    />
  )
}
