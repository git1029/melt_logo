export default /* glsl */ `
  uniform sampler2D positions;
  uniform float uTime;
  uniform float uSize;
  uniform vec2 uResolution;
  uniform vec4 uInfo; // vec4(count, strokeweight, radius, decay)
  uniform float uDisplay;
  
  varying vec3 vDir;
  varying vec2 vUv;

  vec2 getUv(float i) {
    float size = uSize;
    return vec2(
      clamp(mod(i, size) / size, 0., 1.),
      clamp(floor(i / size) / size, 0., 1.)
    );
  }

  void main() { 
    float count = uInfo.x;
    float strokeWeight = uInfo.y;
    float radius = uInfo.z;
    float side = position.z;

    vec3 pos = texture2D(positions, position.xy).xyz;
    float i = pos.z;
    vec2 uv = vec2(side * .5 + .5, 1.-i/count);

    // TODO
    // Implement estimate on 1st/last points
    // if (i == 0.) {
    //   // If first point, calculate prev using the distance to 2nd point
    //   tmp
    //     .copy(p)
    //     .sub(points[i + 1])
    //     .add(p)
    //   tmp.toArray(next, i * 3 * 2)
    //   tmp.toArray(next, i * 3 * 2 + 3)
    // } else {
    //   p.toArray(prev, (i - 1) * 3 * 2)
    //   p.toArray(prev, (i - 1) * 3 * 2 + 3)
    // }

    // if (i === points.length - 1) {
    //   // If last point, calculate next using distance to 2nd last point
    //   tmp
    //     .copy(p)
    //     .sub(points[i - 1])
    //     .add(p)
    //   tmp.toArray(prev, i * 3 * 2)
    //   tmp.toArray(prev, i * 3 * 2 + 3)
    // } else {
    //   p.toArray(next, (i + 1) * 3 * 2)
    //   p.toArray(next, (i + 1) * 3 * 2 + 3)
    // }

    vec2 nUv = getUv(i + 1.);
    vec2 pUv = getUv(i - 1.);
    vec3 next = texture2D(positions, nUv).rgb;
    vec3 prev = texture2D(positions, pUv).rgb;

    vec2 aspect = vec2(uResolution.x / uResolution.y, 1);
    vec2 nextScreen = next.xy * aspect;
    vec2 prevScreen = prev.xy * aspect;

    vec2 tangent = normalize(nextScreen - prevScreen);
    vec2 normal = vec2(-tangent.y, tangent.x);
    normal /= aspect;
    normal *= 1. - abs(uv.y - 0.5) * 2.;

    float dist = length(nextScreen - prevScreen);
    normal *= smoothstep(0.0, 0.05, dist);
    dist = smoothstep(0.0, 0.1/(count / 100.), dist);

    float pixelWidth = 1.0 / 1080.;
    normal *= pixelWidth * strokeWeight * radius * 4.;
    
    vec4 current = vec4(pos, 1);
    current.z = (1.-i/count) * -.5;
    current.xy -= normal * -side * uDisplay;

    vec4 modelPosition = modelMatrix * current;
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;
    gl_Position = projectionPosition;

    vUv = uv;
    vDir = vec3(tangent, dist);
  }
`
