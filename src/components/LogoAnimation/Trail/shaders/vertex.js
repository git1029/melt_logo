export default /* glsl */ `
  uniform vec2 resolution;
  // uniform float uCount;
  // uniform float uStrokeWeight;
  uniform vec4 uInfo; // vec4(uCount, uStrokeWeight, uRadius, 0.)
  uniform float uDisplay;

  varying vec2 vUv;
  varying vec2 vDir;
  varying float vDist;

  attribute vec3 next;
  attribute vec3 prev;
  // attribute vec2 uv;
  attribute vec4 info;
  // attribute float index_;

  float map(float value, float min1, float max1, float min2, float max2) {
    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
  }

  void main() {
    vec2 uv = info.xy;
    float side = info.z;
    float index_ = info.w;
    float uCount = uInfo.x;
    float uStrokeWeight = uInfo.y;
    float uRadius = uInfo.z;

    vec2 aspect = vec2(resolution.x / resolution.y, 1);
    vec2 nextScreen = next.xy * aspect;
    vec2 prevScreen = prev.xy * aspect;

    vec2 tangent = normalize(nextScreen - prevScreen);
    vec2 normal = vec2(-tangent.y, tangent.x);
    normal /= aspect;
    // normal *= 1.0 - pow(abs(uv.y - 0.5) * 1.9, 2.0);
    // normal *= 1.0 - pow(abs(uv.y - 0.5) * 2., 2.0);
    normal *= 1.0 - abs(uv.y - 0.5) * 2.;
    // normal *= 1.0 - abs(uv.y);
    // normal *= .5 + (sin(uv.y * 100.) * .5 + .5) * .5;

    float pixelWidth = 1.0 / 1080.;
    float radius = map(uRadius, 0., 1., 0., 2.);
    // normal *= pixelWidth * 100.;
    normal *= pixelWidth * uStrokeWeight * radius * 2.;

    // When the points are on top of each other, shrink the line to avoid artifacts.
    float dist = length(nextScreen - prevScreen);
    normal *= smoothstep(0.0, 0.05, dist);
    // normal *= smoothstep(0.0, 0.1, dist);
    dist = smoothstep(0.0, 0.1/(uCount / 100.), dist);

    vec3 pos = vec3(position.xy / aspect, 0.);
    pos = vec3(position.xy, 0.);
    vec4 current = vec4(pos, 1);
    current.xy -= normal * -side * uDisplay;

    vec4 p = current;
    p.z = map(index_, 0., uCount, 1., 0.) * -.5;
    
    // vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 modelPosition = modelMatrix * p;
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    // vDist = clamp(dist * 1., 0., 1.);
    vDist = dist;
    vDir = tangent;

    gl_Position = projectionPosition;

    vUv = uv;
  
    // vec3 p = getPosition();
  }
`
