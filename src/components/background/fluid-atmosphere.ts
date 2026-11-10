/**
 * WebGL2 fluid-noise clouds: a black base with deep blue and warm beige swirls and a soft
 * light spot on the right. Draws at 30fps on a capped buffer, pauses while the tab is hidden,
 * and drops to one still frame for reduced motion or when the device cannot hold 24fps.
 */

const VERTEX_SHADER = `#version 300 es
in vec4 a_position;
void main() { gl_Position = a_position; }
`

const FRAGMENT_SHADER = `#version 300 es
precision mediump float;
uniform vec2 u_loop1, u_loop2, u_loop3, u_loop4;
uniform vec2 u_resolution;
uniform vec2 u_grainResolution;
uniform float u_lightCore;
uniform float u_lightHalo;
const vec3 u_c1=vec3(0.);
const vec3 u_c2=vec3(0.);
const vec3 u_c3=vec3(32.,74.,126.)/255.;
const vec3 u_c4=vec3(206.,200.,187.)/255.;
const vec3 u_c5=vec3(0.);
const float u_scale=1.19;
const vec2 u_offset=vec2(-1.24,-.48);
const float u_grain=.005;
const vec2 u_lightPos=vec2(.89,.46);
const float u_vignette=.38;
const float u_bloomThreshold=.61;
const float u_bloomRange=.18;
const float u_bloomStrength=.4;
out vec4 fragColor;

vec3 mod289v3(vec3 x){return x-floor(x*(1./289.))*289.;}
vec4 mod289v4(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 permute(vec4 x){return mod289v4(((x*34.)+1.)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}

float snoise(vec3 v){
  const vec2 C=vec2(1./6.,1./3.);
  const vec4 D=vec4(0.,.5,1.,2.);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289v3(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
  float n_=.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.+1.;
  vec4 s1=floor(b1)*2.+1.;
  vec4 sh=-step(h,vec4(0.));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);
  m=m*m;
  return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}

float hash(vec2 p){
  vec3 p3=fract(vec3(p.xyx)*.1031);
  p3+=dot(p3,p3.yzx+33.33);
  return fract((p3.x+p3.y)*p3.z);
}

float fbm(vec3 p){
  return .6*snoise(p);
}

float fluidNoise(vec2 uv){
  float n1=fbm(vec3(uv*.6,0.) + vec3(u_loop1.y,0.,u_loop1.x));
  float n2=fbm(vec3(uv*.6+5.2,1.3) + vec3(0.,u_loop1.y,u_loop1.x));
  vec2 w1=vec2(n1,n2)*.6;
  float n3=fbm(vec3((uv+w1)*.7+1.7,3.1) + vec3(u_loop2.y,0.,u_loop2.x));
  float n4=fbm(vec3((uv+w1)*.7+9.2,5.7) + vec3(0.,u_loop2.y,u_loop2.x));
  vec2 w2=vec2(n3,n4)*.5;
  return fbm(vec3((uv+w1+w2)*.5,0.) + vec3(u_loop3.y,0.,u_loop3.x));
}

vec2 curlish(vec2 uv){
  float eps=.02;
  float n=snoise(vec3(uv*.8,0.) + vec3(0.,u_loop3.y,u_loop3.x));
  float nx=snoise(vec3((uv+vec2(eps,0.))*.8,0.) + vec3(0.,u_loop3.y,u_loop3.x));
  float ny=snoise(vec3((uv+vec2(0.,eps))*.8,0.) + vec3(0.,u_loop3.y,u_loop3.x));
  return vec2(-(ny-n)/eps,(nx-n)/eps)*.003;
}

void main(){
  float aspect=u_resolution.x/u_resolution.y;
  vec2 uv=gl_FragCoord.xy/u_resolution;
  vec2 suv=vec2(uv.x*aspect, uv.y) * u_scale + u_offset;

  vec2 curl=curlish(suv);
  vec2 uvD=suv+curl*12.;
  float f=fluidNoise(uvD);
  float swirl=snoise(vec3(uvD*.8+f*1.5,0.) + vec3(u_loop4.y,0.,u_loop4.x))*.5+.5;
  float n=f*.5+.5;
  vec3 col=mix(u_c1,u_c2,smoothstep(.2,.5,n));
  col=mix(col,u_c3,smoothstep(.35,.65,n+swirl*.25));
  col=mix(col,u_c4,smoothstep(.6,.85,swirl)*.55);
  col=mix(col,u_c5,smoothstep(.5,.8,n*swirl)*.35);

  vec2 flowOffset = (uvD - suv) * u_grainResolution.y;
  vec2 gp = floor((uv * u_grainResolution + flowOffset) / 5.0);
  col+=(hash(gp)*2.-1.)*u_grain;

  float luma=dot(col,vec3(.299,.587,.114));
  float bloom=smoothstep(u_bloomThreshold-u_bloomRange,u_bloomThreshold+u_bloomRange,luma);
  col+=(col*.85+vec3(.15,.145,.13))*bloom*u_bloomStrength;

  float ld=length((uv-u_lightPos)*vec2(aspect,1.));
  float core=exp(-ld*ld*4.5);
  float halo=exp(-ld*1.8);
  col+=vec3(1.,.97,.9)*core*u_lightCore+vec3(.72,.8,1.)*halo*u_lightHalo;

  float vig=1.-smoothstep(.35,.75,length(uv-.5));
  col=mix(col*(1.-u_vignette),col,vig);
  fragColor=vec4(col,1.);
}
`

const FRAME_MS = 1000 / 30
const TWO_PI = 2 * Math.PI
/** Each noise layer moves round a small circle, so the motion loops with no visible seam. */
const LOOP_PERIODS = [3000, 3300, 3900, 4200]
const LOOP_SPEEDS = [0.0102, 0.0085, 0.17 * 0.04, 0.17 * 0.035]
const MAX_DPR = 1.5
/** Caps the drawing buffer. The clouds are soft, so the browser's upscale is not visible. */
const MAX_BUFFER_WIDTH = 1400
const MAX_BUFFER_PIXELS = 1e6

interface Loop {
  period: number
  location: WebGLUniformLocation | null
  elapsed: number
  radius: number
}

function compileShader(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader)
    return null
  }
  return shader
}

/**
 * Samples the frame rate for up to 3 seconds. Passes when three 300ms windows in a row
 * all reach 24fps and stay within 25% of each other.
 */
function checkFrameRate(onResult: (ok: boolean) => void) {
  let raf = 0
  let start = 0
  let windowStart = 0
  let frames = 0
  const samples: number[] = []
  const tick = (now: number) => {
    raf = 0
    if (!start) start = now
    const elapsed = now - start
    if (elapsed >= 300) {
      if (!windowStart) {
        windowStart = now
        frames = 1
      } else {
        frames += 1
        const windowElapsed = now - windowStart
        if (windowElapsed >= 300) {
          samples.push((1000 * Math.max(0, frames - 1)) / windowElapsed)
          if (samples.length > 3) samples.shift()
          if (samples.length === 3) {
            const min = Math.min(...samples)
            const max = Math.max(...samples)
            if (min >= 24 && (max > 0 ? (max - min) / max : 1) <= 0.25) return onResult(true)
          }
          windowStart = now
          frames = 1
        }
      }
    }
    if (elapsed >= 3000) return onResult(false)
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
  return () => {
    if (raf) cancelAnimationFrame(raf)
  }
}

/**
 * Starts the clouds on `canvas`. Calls `onFallback` when WebGL2 is missing, fails to build,
 * or the context is lost, so the caller can show a still gradient. Returns a cleanup.
 */
export function startFluid(canvas: HTMLCanvasElement, onFallback: () => void): () => void {
  const gl = canvas.getContext('webgl2', {
    alpha: false,
    antialias: false,
    depth: false,
    powerPreference: 'low-power',
    failIfMajorPerformanceCaveat: true,
  })
  if (!gl) {
    onFallback()
    return () => {}
  }

  const program = gl.createProgram()
  const buffer = gl.createBuffer()
  const vertex = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER)
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER)
  const releaseGl = () => {
    if (vertex) gl.deleteShader(vertex)
    if (fragment) gl.deleteShader(fragment)
    if (program) gl.deleteProgram(program)
    if (buffer) gl.deleteBuffer(buffer)
    // Hands the GPU context back now rather than waiting for garbage collection.
    gl.getExtension('WEBGL_lose_context')?.loseContext()
  }
  if (!program || !buffer || !vertex || !fragment) {
    releaseGl()
    onFallback()
    return () => {}
  }
  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    releaseGl()
    onFallback()
    return () => {}
  }

  // biome-ignore lint/correctness/useHookAtTopLevel: WebGL's useProgram, not a React hook.
  gl.useProgram(program)
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
  const position = gl.getAttribLocation(program, 'a_position')
  gl.enableVertexAttribArray(position)
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

  const resolutionLoc = gl.getUniformLocation(program, 'u_resolution')
  const grainLoc = gl.getUniformLocation(program, 'u_grainResolution')
  // Touch screens get no light spot, as in the source design.
  const coarse = window.matchMedia('(hover: none), (pointer: coarse)').matches
  gl.uniform1f(gl.getUniformLocation(program, 'u_lightCore'), coarse ? 0 : 0.14)
  gl.uniform1f(gl.getUniformLocation(program, 'u_lightHalo'), coarse ? 0 : 0.2)

  const loops: Loop[] = LOOP_PERIODS.map((period, i) => ({
    period,
    location: gl.getUniformLocation(program, `u_loop${i + 1}`),
    elapsed: 0,
    radius: (LOOP_SPEEDS[i] * period) / TWO_PI,
  }))
  const advance = (dt: number) => {
    for (const loop of loops) {
      loop.elapsed = (loop.elapsed + dt) % loop.period
      const angle = (loop.elapsed / loop.period) * TWO_PI
      gl.uniform2f(
        loop.location,
        loop.radius * Math.sin(angle),
        loop.radius * (1 - Math.cos(angle)),
      )
    }
  }

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  let stillOnly = motionQuery.matches
  let raf = 0
  let disposed = false
  let needsRedraw = true
  let lastDraw = 0
  let prevTime = 0
  let bufW = 0
  let bufH = 0

  const stopLoop = () => {
    if (raf) cancelAnimationFrame(raf)
    raf = 0
    lastDraw = 0
    prevTime = 0
  }

  const tick = (now: number) => {
    raf = 0
    if (disposed || document.hidden || !bufW || !bufH) return
    if (!needsRedraw && lastDraw && now - lastDraw < FRAME_MS) {
      raf = requestAnimationFrame(tick)
      return
    }
    // Seconds since the last frame, capped so a long pause does not jump the clouds.
    const dt = !stillOnly && prevTime ? 0.001 * Math.min(now - prevTime, 100) : 0
    lastDraw = lastDraw ? now - ((now - lastDraw) % FRAME_MS) : now
    prevTime = now
    advance(dt)
    gl.viewport(0, 0, bufW, bufH)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    needsRedraw = false
    if (!stillOnly) raf = requestAnimationFrame(tick)
  }

  const requestTick = () => {
    stopLoop()
    if (disposed || document.hidden) return
    if (!needsRedraw && stillOnly) return
    raf = requestAnimationFrame(tick)
  }

  const resize = () => {
    const rect = canvas.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
    const pixelW = Math.max(1, Math.round(rect.width * dpr))
    const pixelH = Math.max(1, Math.round(rect.height * dpr))
    const scale = Math.min(
      1,
      MAX_BUFFER_WIDTH / pixelW,
      Math.sqrt(MAX_BUFFER_PIXELS / (pixelW * pixelH)),
    )
    bufW = Math.max(1, Math.floor(pixelW * scale))
    bufH = Math.max(1, Math.floor(pixelH * scale))
    if (canvas.width !== bufW) canvas.width = bufW
    if (canvas.height !== bufH) canvas.height = bufH
    gl.uniform2f(resolutionLoc, bufW, bufH)
    // Grain is sized in real pixels, so it stays fine even on the scaled-down buffer.
    gl.uniform2f(grainLoc, pixelW, pixelH)
    needsRedraw = true
    requestTick()
  }

  const onMotionChange = () => {
    stillOnly = motionQuery.matches
    needsRedraw = true
    requestTick()
  }

  const ro = new ResizeObserver(resize)
  ro.observe(canvas)

  const onLost = (event: Event) => {
    event.preventDefault()
    disposed = true
    stopLoop()
    onFallback()
  }
  canvas.addEventListener('webglcontextlost', onLost)
  document.addEventListener('visibilitychange', requestTick)
  motionQuery.addEventListener('change', onMotionChange)

  let stopCheck = () => {}
  if (!stillOnly) {
    stopCheck = checkFrameRate((ok) => {
      if (disposed) return
      stillOnly = motionQuery.matches || !ok
      needsRedraw = true
      requestTick()
    })
  }

  resize()

  return () => {
    disposed = true
    stopCheck()
    stopLoop()
    ro.disconnect()
    canvas.removeEventListener('webglcontextlost', onLost)
    document.removeEventListener('visibilitychange', requestTick)
    motionQuery.removeEventListener('change', onMotionChange)
    releaseGl()
  }
}
