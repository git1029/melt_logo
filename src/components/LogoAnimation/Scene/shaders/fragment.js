export default /* glsl */ `
  uniform sampler2D uScene;
  uniform sampler2D uLogo;
  uniform sampler2D uLogoC;
  uniform float uTime;
  uniform vec3 uDisp; // vec4(strength, noise, colorShift)
  uniform float uShowMouse;
  uniform float uNormal;
  uniform float uDPR;
  uniform vec4 uResolution;
  uniform vec4 uTransition;
  uniform float uRefractionRatio;
  uniform float PI;

  varying vec3 worldNormal;
  varying vec3 eyeVector;

  float rand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
  }

  float map(float value, float min1, float max1, float min2, float max2) {
    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
  }

  float cubicInOut(float t) {
    return t < 0.5 ? 4. * t * t * t : (t - 1.) * (2. * t - 2.) * (2. * t - 2.) + 1.;
  }

  // cosine based palette, 4 vec3 params
  vec3 palette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
      return a + b*cos( 6.28318*(c*t+d) );
  }

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

    if (aspectS.x > 1.) {
      float scl = min(2560. / uResolution.y, aspectS.x);
      imgScale /= scl;
      imgOff = vec2(
        aspectS.x - scl,
        aspectS.y - scl
      ) * 0.5 / scl;
    }

    float ft = cubicInOut(uTransition.y);

    float kernel = 10.0;
    float weight = 1.0;
    
    vec3 sum = vec3(0.);
    float pixelSize = 1.0 / 1080.; 

    float ior = 1. + (1.-uRefractionRatio);

    vec3 refracted = refract(ev, normal, 1.0/ior);
    refracted.xy /= vec2(uResolution.x/uResolution.y, 1.); 
    refracted.xy *= 1.-ft;

    uv += refracted.xy;

    float uvScl = 0.75;
    uv *= uvScl;
    uv += (1.-uvScl)/2.;
    uv = uv * imgScale - imgOff;

    vec2 vUv3 = uv;
      
    // Horizontal Blur
    vec3 accumulation = vec3(0);
    vec3 weightsum = vec3(0);
    for (float i = -kernel; i <= kernel; i++){
        accumulation += texture2D(uScene, uv_ + vec2(i, i) * pixelSize).xyz * weight;
        weightsum += weight;
    }
    
    sum = accumulation / weightsum;

    vec4 c = vec4(sum, 1.);
    c *= 1.-ft;

    float alpha = texture2D(uScene, uv_).a;
    alpha *= 1.-ft;

    float x = c.r * 2. - 1.;
    float y = c.g * 2. - 1.;
    float strength = map(uDisp.x, 0., 1., 0., 0.3);
    vec2 off = vec2(x, y) * c.a * strength * c.b; // 0.15

    
    float noise = map(uDisp.y, 0., 2., 0., 0.04);
    // NOISE seems to go funny at very high uTime - fix by resetting or removing uTime
    float r = rand(vUv3 + uTime * 0.001);
    off += r * noise * c.a * c.b; // 0.01 // so as not linked to off/strength
    off.y += (-ft * aspectS.y) * (((1.-cubicInOut(abs(uv.x * 2. -1.))) * 1. + .5) + 0.1) + r * .005 * ft * 15.;

    vec2 cOff2 = vec2(0.);
    cOff2.y = (ft * aspectS.y) * r * .01;

    vec2 newUv = vUv3;
    vec4 color = vec4(0.);
    float cShift = map(uDisp.z, 0., 2., 0., 0.04) * 2.; 
    float cOff = sin((newUv.x + newUv.y) * 20.) * cShift * c.b; // 0.01

    color.r += texture2D(uLogo, newUv + off + cOff * sin(uTime * 2.) + cOff2 * sin(uTime * 2.)).r;
    color.g += texture2D(uLogo, newUv + off).g;
    color.b += texture2D(uLogo, newUv + off - cOff * sin(uTime + newUv.x * 1.) - cOff2 * sin(uTime * 2.)).b;
    color.a = 1.;

    vec4 cg = vec4(palette(uTime*.5 + newUv.x * newUv.y , vec3(.5), vec3(.5), vec3(1.), vec3(0., 0.33, 0.67)), 1.);

    vec4 c2 = texture2D(uLogoC, newUv + off) * cg * 3.; // * 1.
    // color += c2 * smoothstep(0., 1., c2.a) * alpha; // can affect smoothstep to get thicker/thinner colour  
    color += c2 * alpha ;
    // color += vec4(c2.rgb * alpha, c2.a); // can affect smoothstep to get thicker/thinner colour  
    // color.a += (c2.r + c2.g + c2.b) / 3. * alpha;

    vec4 c3 = texture2D(uLogoC, newUv + off + cOff2) * cg * ft * 5. * 2.; // * 1.
    // color += c3 * smoothstep(0., 1., c3.a * (sin(uTime * 0. + uv.x * uv.y * 8. * (1.-ft)) *.5 + .5));
    // color += c3 * smoothstep(0., 1., sin(uTime * 0. + uv.x * uv.y * 8. * (1.-ft)) *.5 + .5);
    color += c3;

    color.a = clamp((color.r + color.g + color.b) / 1., 0., 1.);

    color += c * float(uShowMouse);
    color += vec4(normal, 1.) * float(uNormal);

    gl_FragColor = color;
  }
`
