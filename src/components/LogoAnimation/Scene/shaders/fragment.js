// uniform sampler2D envMap;
//   uniform vec2 resolution;
//   uniform float refrationRatio;

//   varying vec3 worldNormal;
//   varying vec3 eyeVector;

//   void main() {
//     // // get screen coordinates
//     // vec2 uv = gl_FragCoord.xy / resolution;

//     // // float ior = 1.15;
//     // float ior = 1. + (1.-refrationRatio);

//     // vec3 normal = worldNormal;
//     // vec3 ev = eyeVector;
//     // normal.z *= -1.;
//     // calculate refraction and add to the screen coordinates
//     vec3 refracted = refract(ev, normal, 1.0/ior);
//     uv *= vec2(resolution.x/resolution.y, 1.);
//     uv += vec2(-0.5, 0.);
//     // uv *= 0.25;
//     // uv *= 0.3333;
//     // uv += 0.3333;
//     uv += refracted.xy;

//     // sample the background texture
//     vec2 vUv = uv;
//     // vUv *= (1.0 / - ev.z);
//     vUv = vUv * .3333 + vec2(0.333);
//     vec4 tex = texture2D(envMap, vUv);

//     // vec4 output = tex;
//     gl_FragColor = vec4(tex.rgb + normal * 0., 1.0);
//   }

export default /* glsl */ `
  uniform sampler2D uScene;
  uniform sampler2D uLogo;
  uniform sampler2D uLogoC;
  uniform float uTime;
  uniform float PI;
  uniform vec3 uDisp; // vec4(strength, noise, colorShift)
  uniform float uShowMouse;
  uniform vec4 uResolution;
  // uniform vec3 uWave;
  uniform vec3 uTransition;
  // uniform vec2 uMouse;
  uniform float refractionRatio;
  // varying vec2 vUv;

  varying vec3 worldNormal;
  varying vec3 eyeVector;

  float rand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
  }

  float map(float value, float min1, float max1, float min2, float max2) {
    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
  }

  float cubicInOut(float t) {
    return t < 0.5
      ? 4.0 * t * t * t
      : 0.5 * pow(2.0 * t - 2.0, 3.0) + 1.0;
  }
  

  // cosine based palette, 4 vec3 params
  vec3 palette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
      return a + b*cos( 6.28318*(c*t+d) );
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    vec2 uv_ = gl_FragCoord.xy / uResolution.xy;


    vec3 normal = worldNormal;
    vec3 ev = eyeVector;

    vec2 aspectS = vec2(
      uResolution.x > uResolution.y ? uResolution.x / uResolution.y : 1., 
      uResolution.x > uResolution.y ? 1. : uResolution.y / uResolution.x 
    );
    vec2 aspectI = vec2(1.);
    
    vec2 imgScale = aspectI * aspectS;
    vec2 imgOff = vec2(
      aspectS.x > aspectI.x ? (aspectS.x - aspectI.x) * .5 : 0.,
      aspectS.y > aspectI.y ? (aspectS.y - aspectI.y) * .5 : 0.
    );

    // if (uResolution.x > uResolution.z) {
    if (aspectS.x > 1.) {
      // float scl = (min(2560., uResolution.x) / uResolution.z - 1.) * 3. + 1.;
      float scl = min(2560. / uResolution.y, aspectS.x);
      // scl = clamp(scl, 1., 2560./uResolution.z);
      imgScale /= scl;
      imgOff = vec2(
        aspectS.x - scl,
        aspectS.y - scl
      ) * 0.5 / scl;
    }
    


    float kernel = 10.0;
    // kernel = 20.0;
    float weight = 1.0;
    
    vec3 sum = vec3(0.);
    float pixelSize = 1.0 / 1080.; 

    // float iorF = 1.;
    // if (uResolution.x < uResolution.z) {
    //   iorF += uResolution.z/uResolution.x * 0.05;
    // }
    float ior = 1. + (1.-refractionRatio);
    // float ior = 1. + (1.-refractionRatio) * iorF;
    // float ior = 1. + (1.-refractionRatio) * min(1., uResolution.x/uResolution.z);
    vec3 refracted = refract(ev, normal, 1.0/ior);
    // uv *= vec2(uResolution.x/uResolution.y, 1.);
    // uv += vec2(-0.5, 0.);

    uv += refracted.xy / vec2(uResolution.x/uResolution.y, 1.);

    float uvScl = 0.75;
    uv *= uvScl;
    uv += (1.-uvScl)/2.;
    uv = uv * imgScale - imgOff;
    vec2 vUv3 = uv;
    // vUv3 = vUv3 * .3333 + vec2(0.333);
    // vec4 tex = texture2D(envMap, vUv);
      
    // Horizontal Blur
    vec3 accumulation = vec3(0);
    vec3 weightsum = vec3(0);
    for (float i = -kernel; i <= kernel; i++){
        accumulation += texture2D(uScene, uv_ + vec2(i * pixelSize, 0.0)).xyz * weight;
        weightsum += weight;
    }
    
    sum = accumulation / weightsum;
    
    // float alpha = texture2D(tDiffuse, vUv).a;

    vec4 c = vec4(sum, 1.);

    float alpha = texture2D(uScene, uv_).a;
    // vec4 c = texture2D(uScene, vUv);

    float x = c.r * 2. - 1.;
    float y = c.g * 2. - 1.;
    float strength = map(uDisp.x, 0., 1., 0., 0.3);
    // float strength = 0.3;
    vec2 off = vec2(x, y) * c.a * strength * c.b; // 0.15

    
    float noise = map(uDisp.y, 0., 2., 0., 0.04);
    // float noise = .02;
    // off += rand(off) * noise * c.a * c.b; // 0.01
    // NOISE seems to go funny at very high uTime - fix by resetting or removing uTime
    off += rand(vUv3 + uTime * 0.001) * noise * c.a * c.b; // 0.01 // so as not linked to off/strength


    // vec2 vUv2 = vUv3 * 2. - 1.;
    // vUv2 *= aspectS;
    // vec2 m = vec2(0.);



    // vec2 m = uMouse;
    // m *= aspectS;
    // float d = length(m - vUv2);
    // d = smoothstep(0., 1., d);
    // vec2 dir2 = normalize((m - vUv2)) * 0.1;
    // float dM = (1.-clamp(d, 0., 1.));

    // vec2 wave = vec2(0.);
    // wave.x = sin(vUv2.y * 6. + uTime * (uWave.y) - m.y*0.) * vUv2.y * uWave.z * sin(vUv2.x * 5.);
    // wave.y = sin(vUv2.x * 3. - uTime * (uWave.y) + -m.x*0.) * vUv2.y * (uWave.z*.5) * cos(vUv2.y * 2. - uTime * 0.2 * uWave.y);
    // wave.y = (sin(vUv2.x * 4. + vUv2.y * 4. - uTime) * .5 + .5) * .1;
    // float n = cos(vUv2.x * vUv2.y - uTime * uWave.y);
    // wave.y += sin(-uTime * uWave.y + vUv2.x * 6. + vUv2.y * 3. + n * 0.5) * (uWave.z*.25) * vUv2.y * n;

    // off += wave * (ft) * fx * fy;
    // off += wave * ((ft) + fx * fy * (1.-ft));

    // float fy = smoothstep(0., 1., 1.-abs(m.y));
    // float fx = smoothstep(-1., .2, 1.-abs(m.x));


    // off += wave * uWave.x;


    vec2 cOff2 = vec2(0.);

    // float et = 0.;
    // if (uTransition.x == 0.) {
    //   float eoff = (1.-vUv.y) * .5 * .5 + (1.-sin(vUv.x * PI)) * 4.;
    //   float es = uTransition.y + eoff * 0.25;
    //   float ed = 3.;
    //   if (uTime < es) et = 0.;
    //   else if (uTime < es + ed) et = map(uTime, es, es + ed, 0., 1.);
    //   else et = 1.;
    //   et = cubicInOut(et);
    //   off.y += -et + rand(wave) * .005 * et * 15.;
    //   cOff2.y = et * 0.1 * rand(off) * 0.1;
    // }

    vec3 uFade = uTransition;
    float fade = 1.-uFade.x;
    float fs = uFade.y;
    float fd = 3.;

    float ts = 0.;
    if (uFade.y != uFade.z && (uFade.y - uFade.z) < fd) {
      ts = 1.-map(uFade.y, uFade.z, uFade.z + fd, 0., 1.);
    }

    float ft = ts;
    float fo = (1.-uv.y) * .5 * .5 + (1.-sin(uv.x * PI)) * 4.;
    fo *= 0.25;
    if (uTime < fs + fo) ft = ts;
    else if (uTime < fs + fd + fo) ft = map(uTime, fs + fo, fs + fd + fo, ts, 1.);
    else ft = 1.;
    if (fade == 0.) ft = 1. - ft;
    ft = cubicInOut(ft);
    ft = 0.;

    // off.y += -ft + rand(wave) * .005 * ft * 15.;
    // cOff2.y = ft * 0.1 * rand(off) * 0.1;


    // vec2 newUv = vUv * imgScale - imgOff;
    // wave.y *= 0.1 * (1.-uv_.y);
    // wave.y += rand(wave) * 0.001;
    vec2 newUv = vUv3;
    vec4 color = vec4(0.);
    float cShift = map(uDisp.z, 0., 2., 0., 0.04) * 2.; 
    float cOff = sin((newUv.x + newUv.y) * 20.) * cShift * c.b; // 0.01
    // for (float i = 0.; i < 1.; i++) {
      // cOff = 0.01 * c.b;
      color.r += texture2D(uLogo, newUv + off + cOff * sin(uTime * 2.) + cOff2 * sin(uTime * 2.)).r;
      color.g += texture2D(uLogo, newUv + off).g;
      color.b += texture2D(uLogo, newUv + off - cOff * sin(uTime + newUv.x * 1.) - cOff2 * sin(uTime * 2.)).b;
    // }
    color.a = 1.;

    vec4 cg = vec4(palette(uTime*.5 + newUv.x * newUv.y , vec3(.5), vec3(.5), vec3(1.), vec3(0., 0.33, 0.67)), 1.);

    vec4 c2 = texture2D(uLogoC, newUv + off) * cg;
    color += c2 * smoothstep(0., 1., c2.a) * alpha; // can affect smoothstep to get thicker/thinner colour  

    vec4 c3 = texture2D(uLogoC, newUv + off + cOff2) * cg * ft * 5.;
    color += c3 * smoothstep(0., 1., c3.a * (sin(uTime * 0. + uv.x * uv.y * 8. * (1.-ft)) *.5 + .5));

    // vec2 uv = gl_FragCoord.xy / uResolution.xy;
    // vec3 color = vec3(uv, 1.0);
    // vec4 color = texture2D(uLogo, vUv);
    // Do your cool postprocessing here
    // color.r += sin(vUv.x * 50.0);
    color += c * uShowMouse;
    gl_FragColor = color + vec4(normal, 1.) *0.;
    // gl_FragColor = texture2D(uLogo, vUv);
  }
`
