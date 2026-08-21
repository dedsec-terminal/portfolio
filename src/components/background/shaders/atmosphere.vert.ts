/**
 * atmosphere.vert.ts — Fullscreen quad vertex shader.
 *
 * Bypasses the MVP matrix entirely, mapping PlaneGeometry(2,2)
 * positions (which range from -1 to 1) directly into NDC clip space.
 * This fills the entire screen regardless of camera type.
 *
 * ShaderScene must set frustumCulled={false} on the mesh to prevent
 * Three.js from incorrectly culling this mesh before the shader runs.
 */
export const atmosphereVertexShader = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  // Direct NDC passthrough — ignores modelViewMatrix / projectionMatrix.
  // PlaneGeometry(2,2) positions span exactly [-1,1] in x and y.
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;
