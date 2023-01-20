export default /* glsl */ `
  uniform sampler2D positions;
  uniform vec2 uMouse;
  uniform float uTime;

  varying vec2 vUv;


  vec2 getUv(float i) {
    float size = 32.;
    return vec2(
      clamp(mod(i, size) / size, 0., 1.),
      clamp(floor(i / size) / size, 0., 1.)
    );
  }

  void main() { 
    float uCount = 1000.;

    vec3 pos = texture2D(positions, vUv).rgb;
    float i = pos.z;

    vec2 nUv = getUv(i + 1.);
    vec2 pUv = getUv(i - 1.);
    vec2 sUv = getUv(uCount - 1.);
    vec3 next = texture2D(positions, nUv).rgb;
    vec3 prev = texture2D(positions, pUv).rgb;
    vec3 start = texture2D(positions, sUv).rgb;

    if (i == uCount - 1.) pos.xy = uMouse.xy;
    else {
      pos.xy = mix(pos.xy,uMouse.xy, i/uCount);
    }

    gl_FragColor = vec4(pos, 1.0);
  }
`
