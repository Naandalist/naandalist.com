import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

// Drifting clouds for the empty band at the bottom of the profile card. A small WebGL port of the
// Vanta "clouds" effect (a 2D fbm cloud shader), without three.js.

const VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'

const FRAG = `precision highp float;
uniform vec2 res;uniform float t;
const vec3 SKY_TOP=vec3(0.18,0.42,0.62);
const vec3 SKY_LOW=vec3(0.41,0.72,0.84);
const vec3 SUN=vec3(1.0,0.60,0.10);
const mat2 M=mat2(1.6,1.2,-1.2,1.6);
vec2 hash(vec2 p){p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));return -1.+2.*fract(sin(p)*43758.5453123);}
float noise(vec2 p){const float K1=.366025404;const float K2=.211324865;
vec2 i=floor(p+(p.x+p.y)*K1);vec2 a=p-i+(i.x+i.y)*K2;vec2 o=(a.x>a.y)?vec2(1.,0.):vec2(0.,1.);
vec2 b=a-o+K2;vec2 c=a-1.+2.*K2;vec3 h=max(.5-vec3(dot(a,a),dot(b,b),dot(c,c)),0.);
vec3 n=h*h*h*h*vec3(dot(a,hash(i)),dot(b,hash(i+o)),dot(c,hash(i+1.)));return dot(n,vec3(70.));}
float fbm(vec2 n){float s=0.;float a=.1;for(int i=0;i<6;i++){s+=noise(n)*a;n=M*n;a*=.4;}return s;}
void main(){
vec2 p=gl_FragCoord.xy/res;vec2 uv=p*vec2(res.x/res.y,1.);
float time=t*.03;float q=fbm(uv*.55);
float r=0.;vec2 u=uv*1.1-q+time;float w=.8;
for(int i=0;i<6;i++){r+=abs(w*noise(u));u=M*u+time;w*=.7;}
float f=0.;u=uv*1.1-q+time;w=.7;
for(int i=0;i<6;i++){f+=w*noise(u);u=M*u+time;w*=.6;}
f*=r+f;
float c=0.;time=t*.06;u=uv*2.2-q+time;w=.4;
for(int i=0;i<5;i++){c+=w*noise(u);u=M*u+time;w*=.6;}
float c1=0.;time=t*.09;u=uv*4.4-q+time;w=.4;
for(int i=0;i<5;i++){c1+=abs(w*noise(u));u=M*u+time;w*=.6;}
c+=c1;
vec3 sky=mix(SKY_LOW,SKY_TOP,p.y);
vec3 cloud=vec3(1.1,1.1,.95)*clamp(.5+.3*c,0.,1.);
f=.2+8.*f*r;
vec3 col=mix(.5*sky,clamp(.5*sky+cloud,0.,1.),clamp(f+c,0.,1.));
col+=SUN*.12*smoothstep(.55,0.,distance(p,vec2(.85,.9)));
gl_FragColor=vec4(col,1.);}`

/** Decorative cloud band. Hidden from assistive tech, a still frame for reduced motion. */
export default function CloudsField({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const gl = canvas?.getContext('webgl', { antialias: false, powerPreference: 'low-power' })
    if (!canvas || !gl) return

    const sh = (type: number, src: string) => {
      const s = gl.createShader(type) as WebGLShader
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return s
    }
    const prog = gl.createProgram() as WebGLProgram
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return
    // biome-ignore lint/correctness/useHookAtTopLevel: gl.useProgram is a WebGL call, not a React hook.
    gl.useProgram(prog)
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'p')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    const uRes = gl.getUniformLocation(prog, 'res')
    const uT = gl.getUniformLocation(prog, 't')

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const resize = () => {
      const r = canvas.getBoundingClientRect()
      // Half resolution is plenty for soft clouds and keeps the shader cheap.
      canvas.width = Math.max(1, Math.round(r.width * 0.5))
      canvas.height = Math.max(1, Math.round(r.height * 0.5))
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform2f(uRes, canvas.width, canvas.height)
    }
    const draw = (ms: number) => {
      gl.uniform1f(uT, ms / 1000 + 40)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }
    resize()
    const ro = new ResizeObserver(() => {
      resize()
      draw(performance.now())
    })
    ro.observe(canvas)
    canvas.style.opacity = '1'

    if (reduced) {
      draw(0)
      return () => ro.disconnect()
    }

    let raf = 0
    let last = 0
    let visible = true
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      if (now - last < 1000 / 30) return
      last = now
      draw(now)
    }
    const sync = () => {
      cancelAnimationFrame(raf)
      if (visible && !document.hidden) raf = requestAnimationFrame(tick)
    }
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      sync()
    })
    io.observe(canvas)
    document.addEventListener('visibilitychange', sync)
    sync()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', sync)
    }
  }, [])

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      tabIndex={-1}
      style={{ opacity: 0 }}
      className={cn('pointer-events-none transition-opacity duration-700', className)}
    />
  )
}
