export default /* glsl */ `
  varying vec2 vUv;
  varying vec2 vDir;
  varying float vDist;

  uniform float uTime;
  uniform vec2 resolution;
  uniform vec4 uInfo;
  // uniform float PI;

  float map(float value, float min1, float max1, float min2, float max2) {
    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
  }

  float cubicInOut(float t) {
    return t < 0.5
      ? 4.0 * t * t * t
      : 0.5 * pow(2.0 * t - 2.0, 3.0) + 1.0;
  }
  
  void main() {
    // vec3 c = vec3(1., sin(uTime)*.5+.5, 0.) * pow(sin(vUv.x * PI), 2.);


    // vec2 newUV = (vUv - vec2(0.5)) * uResolution.zw + vec2(0.5);
    vec4 color = vec4(1.);
    color.r = vDir.x * .5 + .5;
    color.g = vDir.y * .5 + .5;
    color.b = map(vDist, 0., 1., 0., 1.);
    // color.a *= pow(vUv.y, 1.);
    // color.a *= smoothstep(clamp(uInfo.w * .5, 0., 1.), 1., vUv.y);
    color.a *= smoothstep(
      uInfo.w < 0.5 ? 0. : (uInfo.w - 0.5) * 2.,
      uInfo.w < 0.5 ? uInfo.w * 2. : 1., 
      vUv.y
    );
    // color.a *= vUv.y;
    // color.rgb *= sin(pow(cubicInOut(1.-abs(vUv.x * 2. - 1.)), 3.) * 3.14159 * 2. + uTime * 0.);
    color.rgb *= pow(cubicInOut(1.-abs(vUv.x * 2. - 1.)), 3.); // add seperation at edge
    // color.rgb *= smoothstep(.5, .6, 1.-abs(vUv.x * 2. - 1.)); // add seperation at edge
    color.a *= cubicInOut(1.-abs(vUv.x * 2. - 1.)); // fade edge
    // color.a *= smoothstep(.2, .8, 1.-abs(vUv.x * 2. - 1.)); // fade edge
    
    gl_FragColor = color;
    // gl_FragColor = vec4(1., 0., 0., 1.);

    // gl_FragColor = vec4(c, 1.);
  }
`
