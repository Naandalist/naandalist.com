// Vertex: one oversized triangle that covers the viewport.
export const WATER_DITHER_VERT = `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}
`;

// Fragment: the photo's alpha is the water shape and its darkness sets dot
// density. Bayer 4x4 turns density into dots. The photo is scaled so its water
// covers about half the screen height, anchored to the bottom.
// Pointer disturbances deform the water itself: the surface under the pointer
// rises, and a sideways wave runs along it. The dots darken for a moment.
// Everything settles back as the disturbance fades.
export const WATER_DITHER_FRAG = `#version 300 es
precision highp float;

uniform sampler2D u_img;
uniform vec2 u_imgSize;     // source image size in px
uniform vec2 u_res;         // canvas size in device px
uniform float u_time;       // seconds
uniform float u_block;      // dot cell size in device px
uniform vec3 u_ink;
// Disturbances: u_dA = (x, y device px top-left at birth, birth time s, strength; 0 = unused)
//               u_dB = (vx, vy device px/s drift, radius px, unused)
uniform vec4 u_dA[12];
uniform vec4 u_dB[12];

out vec4 fragColor;

const float BAYER[16] = float[16](
   0.0,  8.0,  2.0, 10.0,
  12.0,  4.0, 14.0,  6.0,
   3.0, 11.0,  1.0,  9.0,
  15.0,  7.0, 13.0,  5.0
);

void main() {
  vec2 p = vec2(gl_FragCoord.x, u_res.y - gl_FragCoord.y);   // top-left origin

  // Width is at least the screen width, so the photo always spans edge to edge.
  // The first crest sits about a quarter down the photo, so the water covers
  // about half the viewport height. The photo's bottom edge stays on the screen's
  // bottom edge, and the photo is centered.
  const float WATER_TOP = 0.25;
  float aspect = u_imgSize.x / u_imgSize.y;
  float boxW = max(u_res.x, u_res.y * 0.5 / (1.0 - WATER_TOP) * aspect);
  float boxH = boxW / aspect;
  vec2 origin = vec2((u_res.x - boxW) * 0.5, u_res.y - boxH);
  vec2 boxSize = vec2(boxW, boxH);
  vec2 local = (p - origin) / boxSize;

  bool inside = local.x >= 0.0 && local.x <= 1.0 && local.y >= 0.0 && local.y <= 1.0;
  if (!inside) {
    fragColor = vec4(0.0);
    return;
  }

  // Disturbances deform the water itself. Each one is an elliptical pull that
  // raises and lowers the surface, plus a sideways wave that runs along it.
  // Only pixels that are water move, so the offset stays in the photo.
  vec2 warp = vec2(0.0);
  float dark = 0.0;
  for (int i = 0; i < 12; i++) {
    vec4 a = u_dA[i];
    vec4 b = u_dB[i];
    if (a.w <= 0.0) continue;
    float age = u_time - a.z;
    if (age < 0.0 || age > 1.6) continue;

    vec2 c = a.xy + b.xy * age;                 // the disturbance drifts with the pointer
    vec2 d = p - c;
    vec2 de = d * vec2(1.0, 2.4);               // stretched vertically: water, not a circle
    float dist = length(de) + 0.001;
    float fadeT = exp(-age * 2.0) * a.w;

    float fall = 1.0 - clamp(dist / b.z, 0.0, 1.0);
    fall = fall * fall;
    // Surface rises under the pointer, then sinks back as it fades.
    warp.y -= fall * fadeT * 7.0;
    warp.x -= (d.x / (abs(d.x) + 1.0)) * fall * fadeT * 2.0;
    dark += fall * fadeT * 0.5;

    // Sideways wave running along the surface, away from the impact point.
    float run = abs(d.x) - age * 380.0;
    float wave = sin(run * 0.035) * exp(-run * run * 0.00005) * exp(-age * 1.6) * a.w;
    warp.y += wave * 5.0;
    warp.x += sign(d.x) * wave * 2.0;
  }

  // Slow swell, same motion as before.
  float t = u_time;
  float phase = t * 0.66 - local.x * 2.4;
  float s = sin(phase);
  float surge = s > 0.0 ? pow(s, 1.3) * 0.03 : s * 0.018;
  float nearShore = 1.0 - local.y * 0.6;
  vec2 drift = vec2(
    sin(local.x * 3.0 + t * 0.25) * 0.008 * nearShore,
    -surge * nearShore + sin(local.x * 11.0 - t * 0.7) * 0.003
  );

  // Warp only where the photo has water, so foam and empty space stay put.
  float mask = texture(u_img, local).a;
  vec2 uv = clamp(local + drift + warp * mask / boxSize, 0.0, 1.0);
  vec4 c = texture(u_img, uv);
  float lum = dot(c.rgb, vec3(0.299, 0.587, 0.114));
  // Dark water gets dense dots, white foam gets none.
  float density = c.a * clamp((1.0 - lum) * 1.6, 0.0, 1.0);
  density *= 0.9 + 0.1 * sin(local.x * 6.0 - t * 0.6 + local.y * 3.0);
  density = clamp(density + dark * c.a, 0.0, 1.0);

  vec2 cell = floor(p / u_block);
  int idx = int(mod(cell.y, 4.0)) * 4 + int(mod(cell.x, 4.0));
  float threshold = (BAYER[idx] + 0.5) / 16.0;
  float ink = density > threshold ? 1.0 : 0.0;

  fragColor = vec4(u_ink * ink, ink);   // premultiplied
}
`;
