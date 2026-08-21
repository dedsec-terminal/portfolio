export const atmosphereFragmentShader = `
precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uScroll;
uniform float uReducedMotion;

varying vec2 vUv;

// ── 2D Gradient Noise (Inigo Quilez Isotropic Formulation) ─────────
// Eliminates all hyperbolic banding, marble streaks, and simplex veins
vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float gnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  // Quintic interpolation for smooth C2 continuity
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);

  return mix(
    mix(dot(hash2(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
        dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
    mix(dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
        dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x), u.y
  );
}

// ── 2D Rotation Matrix to Decorrelate Noise Octaves ────────────────
const mat2 rot = mat2(0.80, 0.60, -0.60, 0.80);

// ── Soft Volumetric Cloud FBM ──────────────────────────────────────
float cloudFbm(vec2 p) {
  float f = 0.0;
  f += 0.5000 * (gnoise(p) * 0.5 + 0.5); p = rot * p * 2.02;
  f += 0.2500 * (gnoise(p) * 0.5 + 0.5); p = rot * p * 2.04;
  f += 0.1250 * (gnoise(p) * 0.5 + 0.5); p = rot * p * 2.01;
  f += 0.0625 * (gnoise(p) * 0.5 + 0.5);
  return f / 0.9375;
}

void main() {
  vec2 st = vUv;
  float aspect = uResolution.x / max(uResolution.y, 1.0);

  vec2 uv = st;
  uv.x *= aspect;

  vec2 mouseUv = uMouse;
  mouseUv.x *= aspect;

  // Gentle, restrained mouse parallax
  vec2 mouseDelta = uv - mouseUv;
  float mouseDist = length(mouseDelta);
  float mouseRadius = 0.9;
  float mouseInfluence = smoothstep(mouseRadius, 0.0, mouseDist) * (1.0 - uReducedMotion);
  vec2 mouseOffset = normalize(mouseDelta + 0.0001) * mouseInfluence * 0.02;

  // Ultra-slow, serene ambient drift
  float t = uTime * 0.035;
  float scrollOffset = uScroll * 0.00005;
  vec2 p = uv * 0.48 + vec2(0.0, scrollOffset) + mouseOffset;

  // ── 1. Far Atmospheric Layer (Soft Background Haze) ───────────────
  vec2 farDrift = vec2(t * 0.012, t * 0.006);
  float farNoise = cloudFbm(p * 0.55 + farDrift);
  float farHaze = smoothstep(0.32, 0.72, farNoise) * 0.20;

  // ── 2. Primary Volumetric Cloud Masses ─────────────────────────────
  vec2 midDrift = vec2(t * 0.020, t * 0.012);

  // Large-scale coherent cloud body (low frequency = puffy masses)
  float baseMass = cloudFbm(p * 0.70 + midDrift);
  // Medium-scale edge breakup
  float midDetail = cloudFbm(p * 1.45 - midDrift * 0.6);

  float combined = baseMass * 0.78 + midDetail * 0.22;

  // Soft density threshold: empty space -> feathered mist -> puffy cloud body
  float cloudDensity = smoothstep(0.44, 0.72, combined);
  cloudDensity = pow(cloudDensity, 1.4);

  // Total raw density
  float density = clamp(cloudDensity * 0.80 + farHaze, 0.0, 1.0);

  // ── 3. High-Contrast Hero Readability Mask ─────────────────────────
  // Creates a clean, dark backdrop behind the text elements while
  // preserving rich, puffy cloud atmosphere around the avatar, in corners,
  // and across the rest of the page.
  float textMask = 1.0;
  if (aspect >= 1.0) {
    // Desktop: hero text block is in right column
    vec2 textMin = vec2(0.38, 0.22);
    vec2 textMax = vec2(0.92, 0.82);
    vec2 d = max(textMin - st, st - textMax);
    textMask = smoothstep(0.0, 0.26, length(max(d, vec2(0.0))));
  } else {
    // Mobile: hero text block is centered in lower half
    vec2 textMin = vec2(0.08, 0.32);
    vec2 textMax = vec2(0.92, 0.82);
    vec2 d = max(textMin - st, st - textMax);
    textMask = smoothstep(0.0, 0.22, length(max(d, vec2(0.0))));
  }

  // Fade density to deep background in the reading zone
  density *= mix(0.05, 1.0, textMask);

  // ── 4. Edge Vignette ──────────────────────────────────────────────
  float radial = smoothstep(1.4, 0.45, length(st - vec2(0.5, 0.5)));
  density *= radial;

  // ── 5. Muted Editorial Palette (Charcoal, Slate, Soft Silver) ─────
  // Base background: #09090b
  vec3 colBase        = vec3(0.035, 0.035, 0.043); // #09090b (globals.css background)
  vec3 colDeepAtmo    = vec3(0.052, 0.056, 0.066); // Deep shadow
  vec3 colCloudShadow = vec3(0.075, 0.082, 0.098); // Cloud shadow
  vec3 colCloudBody   = vec3(0.120, 0.132, 0.152); // Soft cloud body
  vec3 colCloudMid    = vec3(0.170, 0.185, 0.210); // Cloud midtone
  vec3 colSoftSilver  = vec3(0.280, 0.300, 0.335); // Subdued silver highlight (subtle)
  vec3 colSteelAccent = vec3(0.140, 0.180, 0.240); // Restrained cool steel

  // Soft atmospheric value gradation
  vec3 color = mix(colBase, colDeepAtmo, smoothstep(0.0, 0.20, density));
  color = mix(color, colCloudShadow, smoothstep(0.20, 0.45, density));
  color = mix(color, colCloudBody, smoothstep(0.45, 0.70, density));
  color = mix(color, colCloudMid, smoothstep(0.70, 0.88, density));
  color = mix(color, colSoftSilver, smoothstep(0.88, 1.0, density) * 0.45);

  // Very subtle cool steel tint in dynamic areas
  color += colSteelAccent * (mouseInfluence * 0.03 + smoothstep(0.65, 0.95, combined) * 0.02);

  // Seamless blend directly over base background
  vec3 finalColor = mix(colBase, color, density);

  gl_FragColor = vec4(finalColor, 1.0);
}
`;
