export default /* glsl */ `
  varying vec2 vUv;

  uniform sampler2D uImage;
  uniform sampler2D uNoise;
  uniform vec3 uColor;
  uniform float uTime;
  uniform float PI;
  uniform vec4 uResolution;
  uniform vec4 uLine; // vec2(lineCount, lineSpeed, lineWidth, colorOff)
  uniform vec4 uDistortion; // vec2(strength, distortion, mouseEnabled, mouseStrength)
  uniform vec2 uMouse;
  // uniform vec2 uDist;

  float rand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

  vec2 getUv(vec2 uv, float flipY) {
    vec2 newUv = uv;

    vec2 aspectS = vec2(
      uResolution.x > uResolution.y ? uResolution.x / uResolution.y : 1., 
      uResolution.x > uResolution.y ? 1. : uResolution.y / uResolution.x 
    );
    vec2 aspectI = vec2(uResolution.z / uResolution.w);
    
    vec2 imgScale = aspectI * aspectS;
    vec2 imgOff = vec2(
      aspectS.x > aspectI.x ? (aspectS.x - aspectI.x) * .5 : 0.,
      aspectS.y > aspectI.y ? (aspectS.y - aspectI.y) * .5 : 0.
    );

    // if (aspectS.x > 1.) {
    //   float scl = min(2560. / uResolution.y, aspectS.x);
    //   imgScale /= scl;
    //   imgOff = vec2(
    //     aspectS.x - scl,
    //     aspectS.y - scl
    //   ) * 0.5 / scl;
    // }

    if (flipY != 0.) newUv.y = 1. - newUv.y;
    newUv = newUv * imgScale - imgOff;

    return newUv;
  }

//   //
// // GLSL textureless classic 2D noise "cnoise",
// // with an RSL-style periodic variant "pnoise".
// // Author:  Stefan Gustavson (stefan.gustavson@liu.se)
// // Version: 2011-08-22
// //
// // Many thanks to Ian McEwan of Ashima Arts for the
// // ideas for permutation and gradient selection.
// //
// // Copyright (c) 2011 Stefan Gustavson. All rights reserved.
// // Distributed under the MIT license. See LICENSE file.
// // https://github.com/stegu/webgl-noise
// //

// vec4 mod289(vec4 x)
// {
//   return x - floor(x * (1.0 / 289.0)) * 289.0;
// }

// vec4 permute(vec4 x)
// {
//   return mod289(((x*34.0)+10.0)*x);
// }

// vec4 taylorInvSqrt(vec4 r)
// {
//   return 1.79284291400159 - 0.85373472095314 * r;
// }

// vec2 fade(vec2 t) {
//   return t*t*t*(t*(t*6.0-15.0)+10.0);
// }

// // Classic Perlin noise
// float cnoise(vec2 P)
// {
//   vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
//   vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
//   Pi = mod289(Pi); // To avoid truncation effects in permutation
//   vec4 ix = Pi.xzxz;
//   vec4 iy = Pi.yyww;
//   vec4 fx = Pf.xzxz;
//   vec4 fy = Pf.yyww;

//   vec4 i = permute(permute(ix) + iy);

//   vec4 gx = fract(i * (1.0 / 41.0)) * 2.0 - 1.0 ;
//   vec4 gy = abs(gx) - 0.5 ;
//   vec4 tx = floor(gx + 0.5);
//   gx = gx - tx;

//   vec2 g00 = vec2(gx.x,gy.x);
//   vec2 g10 = vec2(gx.y,gy.y);
//   vec2 g01 = vec2(gx.z,gy.z);
//   vec2 g11 = vec2(gx.w,gy.w);

//   vec4 norm = taylorInvSqrt(vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11)));
//   g00 *= norm.x;  
//   g01 *= norm.y;  
//   g10 *= norm.z;  
//   g11 *= norm.w;  

//   float n00 = dot(g00, vec2(fx.x, fy.x));
//   float n10 = dot(g10, vec2(fx.y, fy.y));
//   float n01 = dot(g01, vec2(fx.z, fy.z));
//   float n11 = dot(g11, vec2(fx.w, fy.w));

//   vec2 fade_xy = fade(Pf.xy);
//   vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
//   float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
//   return 2.3 * n_xy;
// }

  // cosine based palette, 4 vec3 params
  vec3 palette(float t, vec3 a, vec3 b, vec3 c, vec3 d )
  {
      return a + b*cos( 6.28318*(c*t+d) );
  }

  float cubicInOut(float t) {
    return t < 0.5
      ? 4.0 * t * t * t
      : 0.5 * pow(2.0 * t - 2.0, 3.0) + 1.0;
  }

  float map(float value, float min1, float max1, float min2, float max2) {
    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
  }
  
  void main() {
    vec2 newUv = getUv(vUv, 1.);
    // vec4 color = texture2D(uImage, newUv) * 0.25;
    // color.rgb += uColor;


    float fy = 1.-vUv.y;
    float fx = vUv.x;
    // float n = sin(vUv.x * 10. + uTime * 0.1) * .5 + .5;
    // n *= .2;
    // n += sin(vUv.y * 5. + uTime * 0.2) * .1;
    // n += sin(vUv.y * 15. + uTime * 0.3) * .05;
    // n *= pow(fy, 2.);
    // n *= 0.;

    // float strength = mod((pow(vUv.y, 1.5) + sin((vUv.x * 2. - 1.) * 3.14159 * 4. + sin((vUv.x * 2.-1.)*8.-uTime *.25) + cnoise(vUv * 10. + uTime * 0.1) * fy + uTime * 0.2) * pow(fy,2.) * 0.1 + uTime * 0.05 + b * 0.1 * mix(1., n*.5+.5, fy)) * 24.0, 1.0);
    // // strength = mod(vUv.y * 30.);
    // strength = step(.8 - rand(vUv+ uTime * 0.001) * .2 * fy, strength);

    float t = uTime * uLine.y;

    float r = rand(vUv + uTime * 0.001);
    float rs = r * .5 * fy;
    float rc = r * .001 * fy;
    float x = vUv.x;
    float y = pow(vUv.y, 1.5);
    
    // float ny = cnoise(vUv * 10. + uTime * 0.1) * fy;
    float ny = (texture2D(uNoise, vUv).r * 2. - 1.) * fy * .5;

    y += sin((x*2.-1.) * PI * (4. - uDistortion.y*0.) + sin((x*2.-1.)*8.-uTime*.25) + ny + uTime*.2) * pow(fy,2.) * 0.1 * uDistortion.y * 2.;

    vec2 aspectS = vec2(
      uResolution.x > uResolution.y ? uResolution.x / uResolution.y : 1., 
      uResolution.x > uResolution.y ? 1. : uResolution.y / uResolution.x 
    );
    float mRadius = .3 + ny * .1;
    vec2 m = uMouse * .5 + .5 + ny * .15 * (.5 + (sin(uTime)*.5+.5)*.5);
    m *= aspectS;
    vec2 uv = vUv * aspectS - ny * .1;
    float d = length(m - uv);
    d = clamp(d, 0., mRadius);
    d = mRadius - d;
    d = map(d, 0., mRadius, 0., 1.);
    d = cubicInOut(d);
    d *= mRadius;
    float dy = m.y - uv.y;
    dy = map(dy, -mRadius, mRadius, 0., 1.);
    d *= dy * float(uDistortion.z) * uDistortion.w;
    // float df = map(clamp(length(uDist), 0., 2.), 0., 2., 0.5, 1.);
    // d *= df;
    d *= 1. - (sin(uTime) * .5 + .5)  * .2;
    y += d;


    vec4 tex = texture2D(uImage, newUv + d * .1);
    float b = 0.2126 * tex.r + 0.7152 * tex.g + 0.0722 * tex.b;

    // float mRadiusy = .5;
    // float dy = abs((uMouse.y*.5+.5) - vUv.y + ny * 0.1);
    // dy = clamp(dy, 0., mRadiusy);
    // dy = mRadiusy - dy;
    // dy = map(dy, 0., mRadiusy, 0., 1.);
    // dy = cubicInOut(dy);
    // dy *= mRadiusy;
    // // d = pow(d, 2.);
    // // d = sin(d * PI/2.);
    // d *= 0.8;
    // float my = (uMouse.y*.5+.5);
    // float uvy = vUv.y;
    // d *= my < uvy ? 0. : map(my, uvy, 1., 0., 1.);
    // d *= dy;
    // // d *= uMouse.y *.5 + .5;
    // // d *= 0.2;
    // // y += d;



    y += t * 0.05;
    y += b * 0.1 * mix(1., ny *.5+.5, fy) * uDistortion.x * 2.;

    vec3 c = vec3(y);
    c = mod(c * uLine.x, 1.);
    float cf = uLine.w * 2.;
    c.r += (.2 + d + rc) * sin(uTime + vUv.x * vUv.y + ny) * fy * cf;
    c.b -= (.2 + d + rc) * fy * cos(uTime + vUv.x * 10.) * cf;
    vec3 strength = abs(c * 2. - 1.);
    strength = 1. - strength;
    strength = pow(strength, vec3(2.));
    float w = (uLine.z * 2. - 1.) * 0.4;
    strength = smoothstep(.4 - w, .6 + rs - w, strength);

    // strength = mod(vUv.y * 30., 1.);
    vec3 color = vec3(strength);


    vec3 cg = palette(uTime*.0 + vUv.x * vUv.y * 1., vec3(.5), vec3(.5), vec3(1.), vec3(0., 0.33, 0.67));
    vec3 meltGreen = vec3(222., 250., 82.) / 255.;
    color = mix(color, color * mix(vec3(1.), cg, pow(fy,3.)), clamp(cf, 0., 1.));
    // color *= mix(vec3(1.), cg, 1.-fy);
    // color *= cg;
    
    color.rgb *= uColor;


    gl_FragColor = vec4(color, 1.);
  }
`
