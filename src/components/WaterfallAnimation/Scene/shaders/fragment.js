export default /* glsl */ `
  varying vec2 vUv;

  uniform sampler2D uImage;
  uniform sampler2D uNoise;
  uniform vec3 uColor;
  uniform float uTime;
  uniform float PI;
  uniform vec4 uResolution;
  uniform vec4 uLine; // (lineCount, lineSpeed, lineWidth, colorOff)
  uniform vec4 uDistortion; // (strength, distortion, mouseEnabled, mouseStrength)
  uniform vec2 uMouse;
  uniform vec4 uTransition;
  uniform float uImageScale;

  float rand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

  // cosine based palette, 4 vec3 params
  vec3 palette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
    return a + b*cos( 6.28318*(c*t+d) );
  }

  float cubicInOut(float t) {
    return t < 0.5 ? 4. * t * t * t : (t - 1.) * (2. * t - 2.) * (2. * t - 2.) + 1.;
  }
  
  float map(float value, float min1, float max1, float min2, float max2) {
    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
  }

  vec2 getUv(vec2 uv, float flipY) {
    vec2 imgUv = uv;

    vec2 uvF = vec2(
      uResolution.z / uResolution.x,
      uResolution.w / uResolution.y
    );

    float imgScale = uImageScale + .0;

    // Reset texture aspect
    imgUv /= uvF;

    float uImgFitWidth = 1.;
    float offSide = uImgFitWidth == 1. ? uResolution.x / uResolution.z : uResolution.y / uResolution.w;

    vec2 uvOff = vec2(
      (uResolution.x - uResolution.z * offSide * imgScale),
      (uResolution.y - uResolution.w * offSide * imgScale)
    );

    uvOff *= .5;
    uvOff /= uResolution.zw;

    imgUv -= uvOff;
    imgUv *= uImgFitWidth == 1.? uResolution.z / uResolution.x : uResolution.w / uResolution.y;
    imgUv /= imgScale;

    vec2 newUv = imgUv;
    if (flipY != 0.) newUv.y = 1. - newUv.y;

    return newUv;
  }

  
  void main() {
    float fx = vUv.x;
    float fy = 1. - vUv.y;

    float t = uTime * uLine.y;

    float r = rand(vUv + uTime * .001);
    float rs = r * .5 * fy;
    float rc = r * .001 * fy;
    float x = vUv.x;
    float y = pow(vUv.y, 1.); 
    
    float ny = (texture2D(uNoise, vUv).r * 2. - 1.) * fy * .5;

    y += (sin((x*2.-1.) * PI * (4. + (ny*2.-1.)*1. - uDistortion.y*0.) + sin((x*2.-1.)*8.-uTime*.25) + ny + uTime*.2) *.5 + .5) * pow(fy,2.) * 0.1 * uDistortion.y * 2.;

    vec2 aspectS = vec2(
      uResolution.x > uResolution.y ? uResolution.x / uResolution.y : 1., 
      uResolution.x > uResolution.y ? 1. : uResolution.y / uResolution.x 
    );

    float mRadius = .3 + ny * .1;
    
    vec2 m = uMouse * .5 + .5 + ny * .15 * (.5 + (sin(uTime)*.5+.5)*.5);
    m *= aspectS;
    
    vec2 uv = vUv * aspectS - ny * .1;

    float ld = 4.;
    float tfade = 0.;
    float cfade = 0.;
    if (uTransition.x == 1.) {
      float fades = uTransition.y;
      if (uTime < fades) tfade = 0.;
      else if (uTime < fades + ld) tfade = map(uTime, fades, fades + ld, 0., 1.);
      else {
        tfade = 1.;
        cfade = 1.;
      }
      tfade = cubicInOut(tfade);
    }
    
    float d = length(m - uv);
    d = clamp(d, 0., mRadius);
    d = mRadius - d;
    d = map(d, 0., mRadius, 0., 1.);
    d = cubicInOut(d);
    d *= mRadius;
    
    float dy = m.y - uv.y;
    dy = map(dy, -mRadius, mRadius, 0., 1.);
    
    d *= dy * float(uDistortion.z) * uDistortion.w;
    d *= 1. - (sin(uTime) * .5 + .5)  * .2;
    y += d * (1.-tfade);

    vec2 newUv = getUv(vUv, 0.);
    vec4 tex = texture2D(uImage, newUv + d * .1);

    vec2 imgUv = newUv + d * .1;
    if (imgUv.x < 0. || imgUv.x >= 1. || imgUv.y < 0. || imgUv.y >= 1.) tex *= 0.; 
    float b = 0.2126 * tex.r + 0.7152 * tex.g + 0.0722 * tex.b;
    y += b * 0.1 * mix(1., ny *.5+.5, fy) * uDistortion.x * 2.;

    float speed = 0.05; // 0.05
    y += (t) * speed;

    // Transition out
    // float resF = uResolution.y < 500. ? 0.25 : uResolution.y < 1000. ? map(uResolution.y, 500., 1000., 0.25, 1.) : 1.;
    // resF = 1.;
    // float lineCount = uLine.x > 1. ? floor(uLine.x * resF) : uLine.x;
    float lineCount = uLine.x;
    y -= (uTransition.y) * uLine.y * speed;
    y -= 1./lineCount - mod(uTransition.y * uLine.y * speed, 1./lineCount);
    y += tfade * 1.;

    vec3 c = vec3(uTransition.x == 0. ? y : clamp(y, 0., 1.));
    c = mod(c * lineCount, 1.);
  
    float cf = uLine.w * 2.;
    c.r += (.2 + d + rc) * sin(uTime + vUv.x * vUv.y + ny) * fy * cf;
    c.b -= (.2 + d + rc) * fy * cos(uTime + vUv.x * 10.) * cf;
    
    float w = (uLine.z * 2. - 1.) * 0.4;
    vec3 strength = abs(c * 2. - 1.);
    strength = 1. - strength;
    strength = pow(strength, vec3(2.));
    strength = smoothstep(.4 - w, .6 + rs - w, strength);

    vec3 color = vec3(strength);

    vec3 cg = palette(uTime*.0 + vUv.x * vUv.y * 1., vec3(.5), vec3(.5), vec3(1.), vec3(0., 0.33, 0.67));
    vec3 meltGreen = vec3(222., 250., 82.) / 255.;
    color = mix(color, color * mix(vec3(1.), cg, pow(fy,3.)), clamp(cf, 0., 1.));
    
    color.rgb *= uColor;

    // color *= (1.-cfade);
    // color.a *= 0.;

    gl_FragColor = vec4(color, 1.-tfade);
  }
`
