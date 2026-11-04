import { useRef } from 'react'
import { useWaterDither } from '@/hooks/useWaterDither'

const SRC = '/assets/sea.webp'
const SIZE: [number, number] = [851, 360]

/** Fixed, decorative background. Not interactive, so it is hidden from assistive tech. */
export default function WaterDitherBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useWaterDither(canvasRef, { src: SRC, imageSize: SIZE, rippleSpeed: 0.25 })

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ opacity: 0 }}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-[0.1] transition-opacity duration-700 dark:opacity-[0.09]"
    />
  )
}
