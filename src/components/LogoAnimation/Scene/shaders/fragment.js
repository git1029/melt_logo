export default /* glsl */ `
  uniform sampler2D uScene;
  uniform sampler2D uLogo;
  uniform sampler2D uLogoC;
  uniform float uTime;
  uniform float PI;
  uniform vec3 uDisp; // vec4(strength, noise, colorShift)
  uniform float uShowMouse;
  uniform float uNormal;
  uniform float uDPR;
  uniform vec4 uResolution;
  // uniform vec3 uWave;
  uniform vec4 uTransition;
  // uniform vec2 uMouse;
  uniform float refractionRatio;
  // varying vec2 vUv;
  uniform vec3 uColor;

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


  // float getFadeTime(float fo) {
  //   vec4 uFade = uTransition;

  //   if (uFade.x == 0. && uFade.z == -10. && uFade.w == -10. || uFade.z == uFade.w) return 0.;

  //   float fd = 3.;
  //   float fs = uFade.z + fo * 0.;
  //   float fe = fs + fd;
  //   float ft = 0.;

  //   // If show
  //   // if (uFade.x == 0.) {
  //     // handle show before hide complete
 
  //     // is it less than 3 - show/hide not complete
  //     if ((uFade.z - uFade.w) < fd) {

  //       float ts = (uFade.z - uFade.w) / fd;
  //       if (uFade.x == 0.) {
  //         float ts0 = uFade.y + ts;
  //         float fd0 = ts0 * fd;
  //         if (uTime < fs) ft = ts0;
  //         else if (uTime < fs + fd0) ft = map(uTime, fs, fs + fd0, ts0, 0.);
  //         else ft = 0.;
  //       } else {
  //         float ts0 = uFade.y - ts;
  //         float fd0 = (1.-ts0) * fd;
  //         if (uTime < fs) ft = ts0;
  //         else if (uTime < fs + fd0) ft = map(uTime, fs, fs + fd0, ts0, 1.);
  //         else ft = 1.;
  //       }

  //       // get completion
  //       // float ts = (uFade.z - uFade.w) / fd;
  //       // if (uFade.y < fd) ts = (uFade.y) / fd;
  //       // // if (uFade.x == 1.) ts = 1. - ts;
  //       // // float ts = map(uFade.z, uFade.w, uFade.w + fd, 0., 1.);
  //       // // float ts = uFade.y / 3.;

  //       // if (uFade.x == 0.) {
  //       //   // was being hidden now shown
  //       //   // was going from 0 to 1 ended up at ts
  //       //   // now go from ts back to 0
  //       //   // fe = fs + fd * ts;
  //       //   // fe = fs + fd * ts;
  //       //   // adjust duration/end point
  //       //   fe = fs + fd * ts;
  //       //   if (uTime < fs) ft = ts;
  //       //   else if (uTime < fe) ft = map(uTime, fs, fe, ts, 0.);
  //       //   else ft = 0.;
  //       // }
  //       // else {
  //       //   // was being shown now hidden
  //       //   // was going from 1 to 0 ended up at 1 - ts
  //       //   // now go from 1 - ts to back to 1
  //       //   fe = fs + fd * ts;
  //       //   if (uTime < fs) ft = 0.;
  //       //   else if (uTime < fe) ft = map(uTime, fs, fe, 0., ts);
  //       //   else ft = ts;

  //       //   // ft = 1. - ft;
  //       // }

  //     // ft = 0.;



  //       // if (uFade.x == 1.) ft = ts - ft;


  //       // if (uFade.x == 1.) ft = ts - ft;

  //       // if (uFade.x == 0.) ft = 1. - ft;

  //       // float ts = 1.-map(uFade.y, uFade.z, uFade.z + fd, 0., 1.);
  //       // if (uTime < fs) ft = ts;
  //       // else if (uTime < fe) ft = map(uTime, fs, fe, ts, 1.);
  //       // else ft = 1.;

  //     } else {
  //       // ft = 0.;

  //       fe = fs + fd;
  //       if (uTime < fs) ft = 0.;
  //       else if (uTime < fe) ft = map(uTime, fs, fe, 0., 1.);
  //       else ft = 1.;
  //       if (uFade.x == 0.) ft = 1. - ft;
  //     }
  //   // } 
  //   // // else if hide
  //   // else {
  //   //   if (uTime < fs) ft = 0.;
  //   //   else if (uTime < fe) ft = map(uTime, fs, fe, 0., 1.);
  //   //   else ft = 1.;
  //   // }


  //   // ft = cubicInOut(ft);

  //   return ft;
  // }

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    vec2 uv_ = gl_FragCoord.xy / uResolution.xy;

    float dprScl = 1./uDPR;
    uv *= dprScl;
    uv_ *= dprScl;

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
    

    float fo = (1.-uv.y) * .5 * .5 + (1.-sin(uv.x * PI)) * 4.;
    fo *= 0.25 * 0.;
    // float ft = getFadeTime(fo);
    float ft = cubicInOut(uTransition.y);


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
    refracted.xy /= vec2(uResolution.x/uResolution.y, 1.); 
    
    refracted.xy *= 1.-ft;

    // if (uTransition.x == 1.) {
    //   refracted.xy *= 1.-ft;
    // }
    
    
    // uv *= vec2(uResolution.x/uResolution.y, 1.);
    // uv += vec2(-0.5, 0.);

    uv += refracted.xy;

    float uvScl = 0.75;
    uv *= uvScl;
    uv += (1.-uvScl)/2.;
    uv = uv * imgScale - imgOff;


    vec2 vUv3 = uv;

    // vUv3 += (1.-dprScl)/2.;
    // uv_ += (1.-dprScl)/4.;
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

    // if (uTransition.x == 1.) {
    //   c *= 1.-ft;
    //   alpha *= 1.-ft;
    // }

      c *= 1.-ft;
      alpha *= 1.-ft;

    float x = c.r * 2. - 1.;
    float y = c.g * 2. - 1.;
    float strength = map(uDisp.x, 0., 1., 0., 0.3);
    // float strength = 0.3;
    vec2 off = vec2(x, y) * c.a * strength * c.b; // 0.15

    
    float noise = map(uDisp.y, 0., 2., 0., 0.04);
    // float noise = .02;
    // off += rand(off) * noise * c.a * c.b; // 0.01
    // NOISE seems to go funny at very high uTime - fix by resetting or removing uTime
    float r = rand(vUv3 + uTime * 0.001);
    off += r * noise * c.a * c.b; // 0.01 // so as not linked to off/strength


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

    // vec3 uFade = uTransition;
    // float fade = 1.-uFade.x;
    // float fs = uFade.y;
    // float fd = 3.;

    // float ts = 0.;
    // if (uFade.y != uFade.z && (uFade.y - uFade.z) < fd) {
    //   ts = 1.-map(uFade.y, uFade.z, uFade.z + fd, 0., 1.);
    // }

    // float fo = (1.-uv.y) * .5 * .5 + (1.-sin(uv.x * PI)) * 4.;
    // fo *= 0.25 * 0.;

    // float ft = ts;
    // if (uTime < fs + fo) ft = ts;
    // else if (uTime < fs + fd + fo) ft = map(uTime, fs + fo, fs + fd + fo, ts, 1.);
    // else ft = 1.;
    // if (fade == 1.) ft = 1. - ft;
    // ft = cubicInOut(ft);

 

    // off.y += -ft * .5;
    off.y += -ft * ((1.-cubicInOut(abs(uv.x * 2. -1.))) * 1. + .5) + r * .005 * ft * 15.;
    cOff2.y = ft * r * .01;



    // off.y += (-.5 + r * .01) * ft * uTransition.x;
    // cOff2.y = ft * uTransition.x * 0.01 * r;


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
    color += c * float(uShowMouse);
    color += vec4(normal, 1.) * float(uNormal);

    // color.r = max(color.r, uColor.r);
    // color.g = max(color.g, uColor.g);
    // color.b = max(color.b, uColor.b);

    // color.rgb = max(color.rgb, uColor);
    // color.rgb += vec3(0., 0., .2);

    // c = texture2D(uScene, uv_);
    gl_FragColor = color;
    // gl_FragColor = texture2D(uLogo, vUv);
  }
`
