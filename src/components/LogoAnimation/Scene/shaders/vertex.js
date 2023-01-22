export default /* glsl */ `
  varying vec3 eyeVector;
  varying vec3 worldNormal;
  uniform vec4 uResolution;

  void main() {
    float scl = 1.;
    // float scl = 1. * min(1., uResolution.x/uResolution.z);
    vec4 worldPosition = modelMatrix * vec4( position * scl, 1.0);
    eyeVector = normalize(worldPosition.xyz - cameraPosition);
    worldNormal = normalize( modelViewMatrix * vec4(normal * scl, 0.0)).xyz;
    vec4 pos = projectionMatrix * modelViewMatrix * vec4(position * scl, 1.0);
    
    gl_Position = pos;
  }
`
