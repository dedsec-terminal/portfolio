/**
 * atmosphere.frag.ts — DedSec Terminal procedural atmosphere.
 *
 * Visual design goals (from spec):
 *   - Near-black base (#050608 / #09090b)
 *   - Soft grey-white cloud/mist masses with cool charcoal shadows
 *   - Restrained steel-blue bias only in sparse highlights
 *   - Large coherent forms, feathered edges, slow drift
 *   - Readability mask: quieter atmosphere in the hero text region
 *   - Edge vignette: stronger atmosphere toward viewport edges
 *   - Subtle cursor influence (barely perceptible)
 *
 * Shader model:
 *   UV → aspect-correct space
 *   → mild domain warp
 *   → far haze (low-freq FBM)
 *   → primary cloud masses (mid-freq FBM)
 *   → detail feathering (high-freq FBM)
 *   → soft density threshold (smoothstep, pow)
 *   → hero readability mask
 *   → edge vignette
 *   → palette (charcoal/slate/silver)
 *   → final output (fully opaque)
 */
export const atmosphereFragmentShader = /* glsl */ `
precision highp float;

uniform float uTime;
uniform vec2  uResolution;
uniform vec2  uMouse;
uniform float uScroll;
uniform float uReducedMotion;

varying vec2 vUv;

// ── Hash / gradient noise (IQ isotropic) ───────────────────────────
vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)),
           dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float gnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0); // quintic
  return mix(
    mix(dot(hash2(i + vec2(0.0,0.0)), f - vec2(0.0,0.0)),
        dot(hash2(i + vec2(1.0,0.0)), f - vec2(1.0,0.0)), u.x),
    mix(dot(hash2(i + vec2(0.0,1.0)), f - vec2(0.0,1.0)),
        dot(hash2(i + vec2(1.0,1.0)), f - vec2(1.0,1.0)), u.x),
    u.y);
}

// Rotation matrix — decorrelates octaves to prevent axis-aligned banding
const mat2 ROT = mat2(0.8, 0.6, -0.6, 0.8);

// ── FBM for cloud forms ─────────────────────────────────────────────
float cloudFbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * (gnoise(p) * 0.5 + 0.5);
    p  = ROT * p * 2.01;
    a *= 0.5;
  }
  // Normalize to [0,1] (sum of weights = 0.5+0.25+0.125+0.0625+0.03125 = 0.96875)
  return v / 0.96875;
}

// ── Wispy detail FBM (3 octaves, higher frequency) ──────────────────
float detailFbm(vec2 p) {
  float v = 0.0;
  v += 0.50 * (gnoise(p)       * 0.5 + 0.5);
  v += 0.30 * (gnoise(ROT*p*2.0) * 0.5 + 0.5);
  v += 0.20 * (gnoise(ROT*ROT*p*4.0) * 0.5 + 0.5);
  return v;
}

void main() {
  vec2 st = vUv;   // [0,1] × [0,1]

  // Aspect-correct UV (preserves cloud shapes on wide/tall viewports)
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 uv = vec2(st.x * aspect, st.y);

  // Aspect-correct mouse UV
  vec2 mouseUv = vec2(uMouse.x * aspect, uMouse.y);

  // ── Gentle cursor parallax ──────────────────────────────────────
  vec2 mouseDelta  = uv - mouseUv;
  float mouseDist  = length(mouseDelta);
  float mouseWgt   = smoothstep(1.2, 0.0, mouseDist) * (1.0 - uReducedMotion);
  vec2 mouseOffset = normalize(mouseDelta + 0.0001) * mouseWgt * 0.018;

  // ── Base UVs for cloud sampling ─────────────────────────────────
  float t = uTime * 0.03;
  float scrollDelta = uScroll * 0.00004 * (1.0 - uReducedMotion);
  vec2 p = uv * 0.44 + vec2(0.0, scrollDelta) + mouseOffset;

  // ── Mild domain warp (prevents uniformly drifting blobs) ────────
  // Warp displacement is small — keeps forms coherent
  float warpScale = 0.28;
  vec2 warpDrift  = vec2(t * 0.007, t * 0.004);
  vec2 warpOffset = vec2(
    gnoise(p * 0.8 + warpDrift),
    gnoise(p * 0.8 + warpDrift + vec2(5.2, 1.3))
  ) * warpScale;
  vec2 wp = p + warpOffset * (1.0 - uReducedMotion * 0.7);

  // ── Layer 1: Far atmospheric haze (very low frequency) ──────────
  vec2 farDrift = vec2(t * 0.008, t * 0.004);
  float farNoise = cloudFbm(wp * 0.42 + farDrift);
  float farHaze  = smoothstep(0.30, 0.68, farNoise) * 0.18;

  // ── Layer 2: Primary cloud masses ────────────────────────────────
  vec2 midDrift = vec2(t * 0.016, t * 0.009);

  // Large-scale body — the dominant visual form
  float baseMass = cloudFbm(wp * 0.65 + midDrift);
  // Medium breakup — adds edge variation without destroying coherence
  float midBreak = cloudFbm(wp * 1.30 - midDrift * 0.5);

  float combined = baseMass * 0.80 + midBreak * 0.20;

  // Soft threshold: empty → mist → cloud body
  float cloudDensity = smoothstep(0.43, 0.74, combined);
  cloudDensity = pow(cloudDensity, 1.35); // tighten highlights

  // ── Layer 3: Fine wispy detail ───────────────────────────────────
  vec2 fineDrift = vec2(t * 0.024, t * 0.013);
  float fineDetail = detailFbm(wp * 2.20 + fineDrift);
  // Only adds texture to existing cloud areas — not to empty space
  float wisps = fineDetail * cloudDensity * 0.18;

  // ── Composite density ────────────────────────────────────────────
  float density = clamp(cloudDensity * 0.78 + wisps + farHaze, 0.0, 1.0);

  // ── Hero readability mask ────────────────────────────────────────
  // Reduces cloud density inside the text region with a soft gradient.
  // No visible rectangle — purely a smooth density reduction.
  float textMask;
  if (aspect >= 1.0) {
    // Desktop: hero text is in right column (~38%–92% x, ~20%–82% y)
    vec2 tMin = vec2(0.36, 0.18);
    vec2 tMax = vec2(0.94, 0.84);
    vec2 d = max(tMin - st, st - tMax);
    textMask = smoothstep(0.0, 0.28, length(max(d, 0.0)));
  } else {
    // Mobile: text spans most of the width, lower portion
    vec2 tMin = vec2(0.06, 0.28);
    vec2 tMax = vec2(0.94, 0.84);
    vec2 d = max(tMin - st, st - tMax);
    textMask = smoothstep(0.0, 0.24, length(max(d, 0.0)));
  }
  // In text zone → density drops to near-zero; outside → full density
  density *= mix(0.04, 1.0, textMask);

  // ── Edge vignette (stronger atmosphere toward viewport edges) ────
  vec2 centred = st - 0.5;
  float radial  = length(centred * vec2(1.0, 1.0 / max(aspect, 0.5)));
  float vignette = smoothstep(0.72, 0.22, radial);
  // Vignette slightly BOOSTS density toward edges (inverted typical use)
  density = clamp(density * (0.55 + vignette * 0.60), 0.0, 1.0);

  // ── Palette — cool charcoal / slate / grey-white ─────────────────
  // Hex reference:
  //   #09090b → base background
  //   #0d1117 → deep atmosphere
  //   #111820 → cloud shadow
  //   #1b2330 → cloud body (cool slate)
  //   #2a3340 → cloud midtone
  //   #556170 → soft silver
  //   #8793a3 → rare brightest highlight (barely used)
  vec3 colBase     = vec3(0.035, 0.035, 0.043); // #09090b
  vec3 colDeep     = vec3(0.050, 0.065, 0.090); // deep atmosphere
  vec3 colShadow   = vec3(0.067, 0.094, 0.125); // cloud shadow
  vec3 colBody     = vec3(0.105, 0.137, 0.188); // cloud body
  vec3 colMid      = vec3(0.165, 0.200, 0.250); // cloud midtone
  vec3 colSilver   = vec3(0.333, 0.380, 0.420); // soft silver
  vec3 colHighlight= vec3(0.530, 0.575, 0.638); // rare highlight

  // Multi-stop value gradient (density drives the ramp)
  vec3 color = colBase;
  color = mix(color, colDeep,      smoothstep(0.00, 0.18, density));
  color = mix(color, colShadow,    smoothstep(0.18, 0.40, density));
  color = mix(color, colBody,      smoothstep(0.40, 0.64, density));
  color = mix(color, colMid,       smoothstep(0.64, 0.82, density));
  color = mix(color, colSilver,    smoothstep(0.82, 0.96, density) * 0.75);
  color = mix(color, colHighlight, smoothstep(0.94, 1.00, density) * 0.30);

  // Subtle cool steel tint from cursor proximity (nearly imperceptible)
  vec3 steelTint = vec3(0.06, 0.10, 0.18);
  color += steelTint * (mouseWgt * 0.025 + smoothstep(0.72, 0.96, combined) * 0.015);

  // Clamp and output — fully opaque (alpha:false canvas, no blending needed)
  color = clamp(color, 0.0, 1.0);
  gl_FragColor = vec4(color, 1.0);
}
`;
