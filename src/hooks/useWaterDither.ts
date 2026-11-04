import { useEffect, type RefObject } from 'react'
import { WATER_DITHER_FRAG, WATER_DITHER_VERT } from '@/lib/shaders/waterDither'

export interface WaterDitherOptions {
  /** Source image. Transparent PNG or WebP, the alpha channel is the water shape */
  src: string
  imageSize: [number, number]
  /** Dot cell size in CSS px */
  cellSize?: number
  /** Redraw interval in ms. 33 gives 30fps */
  frameInterval?: number
  /** Pointer speed (CSS px per ms) that starts a ripple */
  rippleSpeed?: number
}

const RIPPLE_SLOTS = 8
const RIPPLE_GAP_MS = 140
const INK_LIGHT = [0x1f / 255, 0x1f / 255, 0x24 / 255] as const
const INK_DARK = [0xeb / 255, 0xeb / 255, 0xf0 / 255] as const

const isDark = () => document.documentElement.classList.contains('dark')

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const shader = gl.createShader(type)
  if (!shader) throw new Error('createShader failed')
  gl.shaderSource(shader, src)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader)
    gl.deleteShader(shader)
    throw new Error(`shader compile: ${log}`)
  }
  return shader
}

/**
 * Draws a dithered water image across the bottom half of the canvas.
 * Pointer movement warps the photo under the cursor, then it springs back. The surface drifts slowly.
 * Pauses when the tab is hidden and draws one still frame for reduced motion.
 */
export function useWaterDither(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  { src, imageSize, cellSize = 3, frameInterval = 33, rippleSpeed = 0.3 }: WaterDitherOptions,
) {
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl2', { premultipliedAlpha: true, alpha: true, antialias: false })
    if (!gl) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    const startedAt = performance.now()

    let program: WebGLProgram | null = null
    let vao: WebGLVertexArrayObject | null = null
    let texture: WebGLTexture | null = null
    let rafId = 0
    let lastDraw = 0
    let disposed = false
    let ready = false

    try {
      const vs = compile(gl, gl.VERTEX_SHADER, WATER_DITHER_VERT)
      const fs = compile(gl, gl.FRAGMENT_SHADER, WATER_DITHER_FRAG)
      program = gl.createProgram()
      if (!program) throw new Error('createProgram failed')
      gl.attachShader(program, vs)
      gl.attachShader(program, fs)
      gl.linkProgram(program)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(`program link: ${gl.getProgramInfoLog(program)}`)
      }
    } catch (err) {
      console.warn('WaterDither: shader setup failed', err)
      return
    }

    const prog = program
    vao = gl.createVertexArray()
    gl.bindVertexArray(vao)
    const loc = {
      img: gl.getUniformLocation(prog, 'u_img'),
      imgSize: gl.getUniformLocation(prog, 'u_imgSize'),
      res: gl.getUniformLocation(prog, 'u_res'),
      time: gl.getUniformLocation(prog, 'u_time'),
      block: gl.getUniformLocation(prog, 'u_block'),
      ink: gl.getUniformLocation(prog, 'u_ink'),
      dA: gl.getUniformLocation(prog, 'u_dA'),
      dB: gl.getUniformLocation(prog, 'u_dB'),
    }

    texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    // One transparent pixel until the photo has loaded.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4))

    // Disturbance slots. dA: x, y, birth, strength. dB: vx, vy, radius, unused.
    // Strength 0 means empty.
    const dA = new Float32Array(RIPPLE_SLOTS * 4)
    const dB = new Float32Array(RIPPLE_SLOTS * 4)
    let nextSlot = 0
    const addDisturbance = (x: number, y: number, vx: number, vy: number, birth: number, strength: number, radius: number) => {
      const i = nextSlot * 4
      dA[i] = x
      dA[i + 1] = y
      dA[i + 2] = birth
      dA[i + 3] = strength
      dB[i] = vx
      dB[i + 1] = vy
      dB[i + 2] = radius
      dB[i + 3] = 0
      nextSlot = (nextSlot + 1) % RIPPLE_SLOTS
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const w = Math.max(1, Math.round(rect.width * dpr))
      const h = Math.max(1, Math.round(rect.height * dpr))
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }
      gl.viewport(0, 0, w, h)
    }

    const draw = (now: number) => {
      if (disposed || !ready) return
      const elapsed = reduceMotion ? 0 : (now - startedAt) / 1000
      const ink = isDark() ? INK_DARK : INK_LIGHT

      gl.useProgram(prog)
      gl.bindVertexArray(vao)
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.uniform1i(loc.img, 0)
      gl.uniform2f(loc.imgSize, imageSize[0], imageSize[1])
      gl.uniform2f(loc.res, canvas.width, canvas.height)
      gl.uniform1f(loc.time, elapsed)
      gl.uniform1f(loc.block, Math.max(1, cellSize * dpr))
      gl.uniform3f(loc.ink, ink[0], ink[1], ink[2])
      gl.uniform4fv(loc.dA, dA)
      gl.uniform4fv(loc.dB, dB)

      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    const loop = (now: number) => {
      rafId = 0
      if (disposed || document.hidden) return
      if (now - lastDraw >= frameInterval) {
        lastDraw = now
        draw(now)
      }
      rafId = requestAnimationFrame(loop)
    }

    const scheduleStart = () => {
      if (disposed) return
      const idle = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback
      if (idle) idle(() => start(), { timeout: 1500 })
      else window.setTimeout(start, 300)
    }
    const start = () => {
      if (reduceMotion || rafId || document.hidden || !ready) return
      rafId = requestAnimationFrame(loop)
    }
    const stop = () => {
      if (rafId) cancelAnimationFrame(rafId)
      rafId = 0
    }

    const image = new Image()
    image.decoding = 'async'
    image.onload = () => {
      if (disposed || !texture) return
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
      ready = true
      // Show the still frame first, so LCP and first paint are not waiting on animation.
      draw(performance.now())
      canvas.style.removeProperty('opacity')
      if (reduceMotion) return
      // Start the loop only after the page has loaded and the browser is idle.
      if (document.readyState === 'complete') scheduleStart()
      else window.addEventListener('load', scheduleStart, { once: true })
    }
    image.src = src

    // Fast pointer moves push a disturbance into the photo. It drifts a little
    // with the pointer, so the warp trails behind the movement.
    let lastX = 0
    let lastY = 0
    let lastT = 0
    let lastPush = 0
    const onPointerMove = (e: PointerEvent) => {
      if (reduceMotion || disposed) return
      const rect = canvas.getBoundingClientRect()
      const now = performance.now()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const dt = now - lastT
      const dx = x - lastX
      const dy = y - lastY
      const speed = dt > 0 ? Math.hypot(dx, dy) / dt : 0
      lastX = x
      lastY = y
      lastT = now
      if (speed < rippleSpeed || now - lastPush < RIPPLE_GAP_MS) return
      lastPush = now
      const strength = Math.min(1, speed / 1.2)
      // Drift in device px/s: pointer velocity scaled down, capped.
      const drift = Math.min(400, speed * 1000 * 0.25) * dpr
      const vx = (dx / (dt || 1)) * 1000 * 0.25 * dpr
      const vy = (dy / (dt || 1)) * 1000 * 0.25 * dpr
      const mag = Math.hypot(vx, vy) || 1
      addDisturbance(
        x * dpr,
        y * dpr,
        (vx / mag) * drift,
        (vy / mag) * drift,
        (now - startedAt) / 1000,
        strength,
        140 * dpr,
      )
    }

    const onVisibility = () => (document.hidden ? stop() : start())
    const onResize = () => {
      resize()
      if (!rafId && !disposed) draw(performance.now())
    }

    resize()
    const ro = new ResizeObserver(onResize)
    ro.observe(canvas)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)

    // Theme toggles change the ink color, so redraw even while paused.
    const mo = new MutationObserver(() => {
      if (!rafId && !disposed) draw(performance.now())
    })
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    return () => {
      disposed = true
      stop()
      ro.disconnect()
      mo.disconnect()
      window.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('visibilitychange', onVisibility)
      if (texture) gl.deleteTexture(texture)
      if (vao) gl.deleteVertexArray(vao)
      gl.deleteProgram(prog)
    }
  }, [canvasRef, src, imageSize, cellSize, frameInterval, rippleSpeed])
}
