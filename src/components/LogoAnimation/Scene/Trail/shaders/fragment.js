export default /* glsl */ `
  uniform vec4 uInfo; // vec4(count, strokeweight, radius, decay)

  varying vec2 vUv;
  varying vec3 vDir;

  float map(float value, float min1, float max1, float min2, float max2) {
    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
  }

  float cubicInOut(float t) {
    return t < 0.5 ? 4. * t * t * t : (t - 1.) * (2. * t - 2.) * (2. * t - 2.) + 1.;
  }

  void main() {
    if (gl_PointCoord.x < -1. || gl_PointCoord.x > 1. || gl_PointCoord.y < -1. || gl_PointCoord.y > 1.) discard;

    float decay = uInfo.w;
    float dist = vDir.z;

    vec4 color = vec4(1.);
    color.r = vDir.x * .5 + .5;
    color.g = vDir.y * .5 + .5;

    // color.b = map(vDist, 0., 1., 0., 1.);
    color.b = dist;
    // color.a *= pow(vUv.y, 1.);
    // color.a *= smoothstep(clamp(uInfo.w * .5, 0., 1.), 1., vUv.y);
    color.a *= smoothstep(
      decay < 0.5 ? 0. : (decay - 0.5) * 2.,
      decay < 0.5 ? decay * 2. : 1., 
      vUv.y
    );
    // color.a *= vUv.y;
    // color.rgb *= sin(pow(cubicInOut(1.-abs(vUv.x * 2. - 1.)), 3.) * 3.14159 * 2. + uTime * 0.);
    color.rgb *= pow(cubicInOut(1.-abs(vUv.x * 2. - 1.)), 3.); // add seperation at edge
    // color.rgb *= smoothstep(.5, .6, 1.-abs(vUv.x * 2. - 1.)); // add seperation at edge
    color.a *= cubicInOut(1.-abs(vUv.x * 2. - 1.)); // fade edge
    // color.a *= smoothstep(.2, .8, 1.-abs(vUv.x * 2. - 1.)); // fade edge

    gl_FragColor = color;
  }
`
