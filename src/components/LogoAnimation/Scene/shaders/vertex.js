export default /* glsl */ `
// varying vec2 vUv;
// void main() {
//   // gl_Position = vec4(position, 1.0);
//   vec4 modelPosition = modelMatrix * vec4(position, 1.0);
//   vec4 viewPosition = viewMatrix * modelPosition;
//   vec4 projectionPosition = projectionMatrix * viewPosition;

//   gl_Position = projectionPosition;

//   vUv = uv;
// }

varying vec3 eyeVector;
varying vec3 worldNormal;
uniform vec4 uResolution;
// varying vec2 vUv;

void main() {
  float scl = 1.;
  // float scl = 1. * min(1., uResolution.x/uResolution.z);
  vec4 worldPosition = modelMatrix * vec4( position * scl, 1.0);
  // worldPosition.z = 0.;
  eyeVector = normalize(worldPosition.xyz - cameraPosition);
  worldNormal = normalize( modelViewMatrix * vec4(normal * scl, 0.0)).xyz;
  vec4 pos = projectionMatrix * modelViewMatrix * vec4(position * scl, 1.0);
  // pos.y = 0.;
  // vUv = uv;
  gl_Position = pos;
}
`
