import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

/**
 * Monochrome Dither Canvas (ObsidianUI inspired)
 * Uses WebGL2 fluid disturbance + Bayer 4x4 matrix dither in strict monochrome.
 * Lightweight, zero external dependencies, battery friendly, auto-pauses on background tabs.
 */

const FC = 64
const FR = 48
const FN = FC * FR
const CC = 90
const EDGE_LO = 36
const EDGE_HI = 130
const EDGES = ['~', '≈', '∼', '·', '-']
const BRIGHTS = ['r', 'a', 'i', 'h', 'a', 'n', 'p', 'k']
const ALL_CHARS = [...EDGES, ...BRIGHTS]
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5]
const TL = 360
const TS = 12
const TM = 48
const TRAIL_CFG = { fb: 0.08, fss: 16, ffm: 0.14, fir: 0.8, firl: 1.0 }

const VS = `#version 300 es
in vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`

const FS = `#version 300 es
precision highp float;
uniform sampler2D uFluid, uAtlas;
uniform vec2 uRes;
uniform int uPhase, uTrailN;
uniform vec4 uTP[${TM}];
uniform float uTL[${TM}];
uniform float uDark;
out vec4 O;

const float CC = ${CC}.0;
const float FC = ${FC}.0;
const float FR = ${FR}.0;
const float EL = ${EDGE_LO}.0;
const float EH = ${EDGE_HI}.0;
const int BAYER[16] = int[16](${BAYER.map((v) => Math.round((v / 16) * 255)).join(',')});
const int CHAR_N = ${ALL_CHARS.length};

void main() {
  float cw = uRes.x / CC;
  float rows = ceil(uRes.y / cw) + 1.0;
  float gx = floor(gl_FragCoord.x / cw);
  float gy = floor((uRes.y - gl_FragCoord.y) / cw);
  if (gx >= CC || gy >= rows) discard;

  vec2 cp = vec2(fract(gl_FragCoord.x / cw), fract((uRes.y - gl_FragCoord.y) / cw));
  vec2 bp = vec2((gx + 0.5) * cw, (gy + 0.5) * cw);
  ivec2 fc = ivec2(gx / CC * FC, gy / rows * FR);
  fc = clamp(fc, ivec2(0), ivec2(int(FC) - 1, int(FR) - 1));
  vec2 flow = texelFetch(uFluid, fc, 0).rg;

  vec2 disp = vec2(0.0);
  for (int i = 0; i < uTrailN; i++) {
    float life = uTL[i];
    if (life <= 0.0) continue;
    vec2 d = bp - uTP[i].xy;
    float r = 6.0 + life * 4.0;
    float d2 = dot(d, d);
    if (d2 == 0.0 || d2 > r * r) continue;
    float dist = sqrt(d2);
    float f = 1.0 - dist / r;
    f *= f;
    disp += (d / dist) * (f * life * 3.0) + uTP[i].zw * (f * 0.04);
  }

  vec2 sp = bp + disp + flow * 5.0;
  vec2 uv = clamp(sp / uRes, 0.0, 1.0);

  // Procedural subtle sine wave pattern
  float p = float(uPhase);
  float wave = sin(uv.x * 6.2831853 + p * 0.04) * cos(uv.y * 5.0 + p * 0.03);
  float signal = smoothstep(-0.8, 0.8, wave);
  float bg = signal * 200.0;

  float hm = min(1.0, length(flow) * 1.2);
  float gray = bg * (1.0 - hm) + (255.0 - bg) * hm;
  float thr = float(BAYER[(int(gy) & 3) * 4 + (int(gx) & 3)]);

  bool lit = gray > thr;
  if (!lit && hm <= 0.05) discard;

  int ci;
  if (gray >= EL && gray <= EH) {
    ci = uPhase % 5;
  } else if (gray > EH) {
    ci = 5 + uPhase % ${BRIGHTS.length};
  } else {
    discard;
  }

  float au = (float(ci) + cp.x) / float(CHAR_N);
  float ca = texture(uAtlas, vec2(au, cp.y)).a;
  if (ca < 0.08) discard;

  // Strict monochrome: slightly reduced by ~1% from original (13% dark / 7% light)
  vec3 col = uDark > 0.5 ? vec3(0.92, 0.92, 0.94) : vec3(0.12, 0.12, 0.14);
  float alpha = ca * (uDark > 0.5 ? 0.13 : 0.07);
  alpha = mix(alpha, alpha * 2.0, hm);

  O = vec4(col * alpha, alpha);
}
`

function createFluid() {
  const vx = new Float32Array(FN)
  const vy = new Float32Array(FN)
  const vx0 = new Float32Array(FN)
  const vy0 = new Float32Array(FN)
  const p = new Float32Array(FN)
  const div = new Float32Array(FN)

  const fi = (x: number, y: number) =>
    Math.max(0, Math.min(FR - 1, y)) * FC + Math.max(0, Math.min(FC - 1, x))

  const bnd = (b: number, a: Float32Array) => {
    for (let x = 1; x < FC - 1; x++) {
      a[fi(x, 0)] = b === 2 ? -a[fi(x, 1)] : a[fi(x, 1)]
      a[fi(x, FR - 1)] = b === 2 ? -a[fi(x, FR - 2)] : a[fi(x, FR - 2)]
    }
    for (let y = 1; y < FR - 1; y++) {
      a[fi(0, y)] = b === 1 ? -a[fi(1, y)] : a[fi(1, y)]
      a[fi(FC - 1, y)] = b === 1 ? -a[fi(FC - 2, y)] : a[fi(FC - 2, y)]
    }
  }

  const diffuse = (b: number, d: Float32Array, s: Float32Array, diff: number, dt: number) => {
    const a = dt * diff * FN
    for (let k = 0; k < 4; k++) {
      for (let y = 1; y < FR - 1; y++) {
        for (let x = 1; x < FC - 1; x++) {
          d[fi(x, y)] =
            (s[fi(x, y)] +
              a *
                (d[fi(x - 1, y)] +
                  d[fi(x + 1, y)] +
                  d[fi(x, y - 1)] +
                  d[fi(x, y + 1)])) /
            (1 + 4 * a)
        }
      }
      bnd(b, d)
    }
  }

  const advect = (
    b: number,
    d: Float32Array,
    d0: Float32Array,
    ux: Float32Array,
    uy: Float32Array,
    dt: number
  ) => {
    const dtx = dt * FC * 1.4
    const dty = dt * FR * 1.4
    for (let y = 1; y < FR - 1; y++) {
      for (let x = 1; x < FC - 1; x++) {
        const px = Math.max(0.5, Math.min(FC - 1.5, x - dtx * ux[fi(x, y)]))
        const py = Math.max(0.5, Math.min(FR - 1.5, y - dty * uy[fi(x, y)]))
        const x0 = Math.floor(px)
        const y0 = Math.floor(py)
        const s1 = px - x0
        const s0 = 1 - s1
        const t1 = py - y0
        const t0 = 1 - t1
        d[fi(x, y)] =
          s0 * (t0 * d0[fi(x0, y0)] + t1 * d0[fi(x0, y0 + 1)]) +
          s1 * (t0 * d0[fi(x0 + 1, y0)] + t1 * d0[fi(x0 + 1, y0 + 1)])
      }
    }
    bnd(b, d)
  }

  const project = (ux: Float32Array, uy: Float32Array) => {
    const hx = 1 / FC
    const hy = 1 / FR
    for (let y = 1; y < FR - 1; y++) {
      for (let x = 1; x < FC - 1; x++) {
        div[fi(x, y)] =
          -0.5 *
          (hx * (ux[fi(x + 1, y)] - ux[fi(x - 1, y)]) +
            hy * (uy[fi(x, y + 1)] - uy[fi(x, y - 1)]))
        p[fi(x, y)] = 0
      }
    }
    bnd(0, div)
    bnd(0, p)
    for (let k = 0; k < 4; k++) {
      for (let y = 1; y < FR - 1; y++) {
        for (let x = 1; x < FC - 1; x++) {
          p[fi(x, y)] =
            (div[fi(x, y)] +
              p[fi(x - 1, y)] +
              p[fi(x + 1, y)] +
              p[fi(x, y - 1)] +
              p[fi(x, y + 1)]) /
            4
        }
      }
      bnd(0, p)
    }
    for (let y = 1; y < FR - 1; y++) {
      for (let x = 1; x < FC - 1; x++) {
        ux[fi(x, y)] -= 0.5 * ((p[fi(x + 1, y)] - p[fi(x - 1, y)]) / hx)
        uy[fi(x, y)] -= 0.5 * ((p[fi(x, y + 1)] - p[fi(x, y - 1)]) / hy)
      }
    }
    bnd(1, ux)
    bnd(2, uy)
  }

  return {
    vx,
    vy,
    step() {
      diffuse(1, vx0, vx, 0.00002, 0.016)
      diffuse(2, vy0, vy, 0.00002, 0.016)
      project(vx0, vy0)
      advect(1, vx, vx0, vx0, vy0, 0.016)
      advect(2, vy, vy0, vx0, vy0, 0.016)
      project(vx, vy)
      for (let i = 0; i < FN; i++) {
        vx[i] *= 0.94
        vy[i] *= 0.94
      }
    },
  }
}

interface DitherCanvasProps {
  className?: string
}

export default function MonochromeDitherCanvas({ className }: DitherCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Avoid running on mobile devices to protect battery
    if (window.innerWidth < 768) return

    let gl: WebGL2RenderingContext | null = null
    try {
      gl = canvas.getContext('webgl2', { alpha: true, antialias: false })
    } catch {
      return
    }
    if (!gl) return

    const textures: WebGLTexture[] = []
    const shaders: WebGLShader[] = []
    const buffers: WebGLBuffer[] = []
    let prog: WebGLProgram | null = null
    let rafId = 0
    let disposed = false

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (motion.matches) return

    try {
      const mkShader = (type: number, source: string) => {
        const shader = gl!.createShader(type)
        if (!shader) throw new Error('Shader failed')
        shaders.push(shader)
        gl!.shaderSource(shader, source)
        gl!.compileShader(shader)
        return shader
      }

      const mkTex = (unit: number) => {
        const tex = gl!.createTexture()
        if (!tex) throw new Error('Texture failed')
        textures.push(tex)
        gl!.activeTexture(gl!.TEXTURE0 + unit)
        gl!.bindTexture(gl!.TEXTURE_2D, tex)
        gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.NEAREST)
        gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.NEAREST)
        gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE)
        gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE)
        return tex
      }

      prog = gl.createProgram()
      if (!prog) throw new Error('Program failed')
      gl.attachShader(prog, mkShader(gl.VERTEX_SHADER, VS))
      gl.attachShader(prog, mkShader(gl.FRAGMENT_SHADER, FS))
      gl.linkProgram(prog)
      gl.useProgram(prog)

      const loc = (name: string) => gl!.getUniformLocation(prog!, name)
      const buf = gl.createBuffer()
      if (!buf) throw new Error('Buffer failed')
      buffers.push(buf)
      gl.bindBuffer(gl.ARRAY_BUFFER, buf)
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
        gl.STATIC_DRAW
      )

      const aPos = gl.getAttribLocation(prog, 'a_pos')
      gl.enableVertexAttribArray(aPos)
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

      const fluidTex = mkTex(0)
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, fluidTex)

      // Generate character atlas in memory
      const atlasCanvas = document.createElement('canvas')
      const CELL = 48
      atlasCanvas.width = CELL * ALL_CHARS.length
      atlasCanvas.height = CELL
      const actx = atlasCanvas.getContext('2d')
      if (actx) {
        actx.font = `${CELL * 0.88}px monospace`
        actx.textAlign = 'center'
        actx.textBaseline = 'middle'
        actx.fillStyle = '#fff'
        ALL_CHARS.forEach((char, index) =>
          actx.fillText(char, CELL * (index + 0.5), CELL * 0.5)
        )
      }

      mkTex(1)
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        atlasCanvas
      )

      gl.uniform1i(loc('uFluid'), 0)
      gl.uniform1i(loc('uAtlas'), 1)

      const fluid = createFluid()
      const fluidData = new Float32Array(FN * 2)
      const mouse = { x: -9999, y: -9999, vx: 0, vy: 0 }
      const trail: { x: number; y: number; vx: number; vy: number; b: number }[] = []
      const now = () => performance.now()

      const onPointerMove = (e: MouseEvent) => {
        const rect = canvas!.getBoundingClientRect()
        const px = mouse.x
        const py = mouse.y
        mouse.x = e.clientX - rect.left
        mouse.y = e.clientY - rect.top
        mouse.vx = mouse.x - px
        mouse.vy = mouse.y - py

        if (px < 0 || py < 0) {
          trail.unshift({ x: mouse.x, y: mouse.y, vx: 0, vy: 0, b: now() })
          if (trail.length > TM) trail.length = TM
          return
        }

        const d = Math.hypot(mouse.vx, mouse.vy)
        if (d < 0.5) return
        const steps = Math.max(1, Math.ceil(d / TS))
        const birth = now()
        for (let s = 1; s <= steps; s++) {
          const t = s / steps
          trail.unshift({
            x: px + mouse.vx * t,
            y: py + mouse.vy * t,
            vx: mouse.vx / steps,
            vy: mouse.vy / steps,
            b: birth,
          })
          if (trail.length > TM) trail.length = TM
        }
      }

      window.addEventListener('pointermove', onPointerMove, { passive: true })

      let W = 1
      let H = 1
      const resize = () => {
        if (!canvas) return
        W = canvas.width = window.innerWidth
        H = canvas.height = window.innerHeight
        gl!.viewport(0, 0, W, H)
      }
      resize()
      window.addEventListener('resize', resize)

      gl.enable(gl.BLEND)
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

      const uTP = loc('uTP')
      const uTLoc = loc('uTL')
      const uRes = loc('uRes')
      const uPhase = loc('uPhase')
      const uTrailN = loc('uTrailN')
      const uDark = loc('uDark')

      const tpBuf = new Float32Array(TM * 4)
      const tlBuf = new Float32Array(TM)
      let phase = 0
      let frame = 0

      const draw = () => {
        if (disposed) return
        const ts = now()
        const isDark = document.documentElement.classList.contains('dark')

        for (let i = trail.length - 1; i >= 0; i--) {
          const pt = trail[i]
          const age = ts - pt.b
          if (age >= TL) {
            trail.splice(i, 1)
            continue
          }
          const life = 1 - age / TL
          const radius = TRAIL_CFG.fir + life * TRAIL_CFG.firl
          const gr = Math.ceil(radius)
          const speed = Math.hypot(pt.vx, pt.vy)
          const force = (TRAIL_CFG.fb + Math.min(speed, TRAIL_CFG.fss) / TRAIL_CFG.fss) * life
          const cx = ((pt.x / W) * FC) | 0
          const cy = ((pt.y / H) * FR) | 0

          for (let dy = -gr; dy <= gr; dy++) {
            for (let dx = -gr; dx <= gr; dx++) {
              const dist = Math.hypot(dx, dy)
              if (dist > radius) continue
              const f = Math.pow(1 - dist / radius, 2)
              const idx = (cx + dx + (cy + dy) * FC) % FN
              if (idx >= 0 && idx < FN) {
                fluid.vx[idx] += pt.vx * f * force * TRAIL_CFG.ffm
                fluid.vy[idx] += pt.vy * f * force * TRAIL_CFG.ffm
              }
            }
          }
        }

        fluid.step()
        if (frame++ % 6 === 0) phase = (phase + 1) % 255

        for (let i = 0; i < FN; i++) {
          fluidData[i * 2] = fluid.vx[i]
          fluidData[i * 2 + 1] = fluid.vy[i]
        }

        gl!.activeTexture(gl!.TEXTURE0)
        gl!.bindTexture(gl!.TEXTURE_2D, fluidTex)
        gl!.texImage2D(
          gl!.TEXTURE_2D,
          0,
          gl!.RG32F,
          FC,
          FR,
          0,
          gl!.RG,
          gl!.FLOAT,
          fluidData
        )

        tpBuf.fill(0)
        tlBuf.fill(0)
        for (let i = 0; i < trail.length; i++) {
          const pt = trail[i]
          tpBuf[i * 4] = pt.x
          tpBuf[i * 4 + 1] = pt.y
          tpBuf[i * 4 + 2] = pt.vx
          tpBuf[i * 4 + 3] = pt.vy
          tlBuf[i] = 1 - (ts - pt.b) / TL
        }

        gl!.uniform4fv(uTP, tpBuf)
        gl!.uniform1fv(uTLoc, tlBuf)
        gl!.uniform1i(uTrailN, trail.length)
        gl!.uniform2f(uRes, W, H)
        gl!.uniform1i(uPhase, phase)
        gl!.uniform1f(uDark, isDark ? 1.0 : 0.0)

        gl!.clearColor(0, 0, 0, 0)
        gl!.clear(gl!.COLOR_BUFFER_BIT)
        gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4)

        rafId = requestAnimationFrame(draw)
      }

      rafId = requestAnimationFrame(draw)

      return () => {
        disposed = true
        cancelAnimationFrame(rafId)
        window.removeEventListener('pointermove', onPointerMove)
        window.removeEventListener('resize', resize)
        textures.forEach((t) => gl?.deleteTexture(t))
        buffers.forEach((b) => gl?.deleteBuffer(b))
        shaders.forEach((s) => gl?.deleteShader(s))
        if (prog) gl?.deleteProgram(prog)
      }
    } catch {
      // Graceful fallback: silent cleanup if WebGL2 unavailable
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn(
        'pointer-events-none fixed inset-0 z-0 h-full w-full opacity-75 dark:opacity-60 transition-opacity duration-700',
        className
      )}
    />
  )
}
