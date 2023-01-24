import * as THREE from 'three'
import { HorizontalBlurShader } from 'three/examples/jsm/shaders/HorizontalBlurShader'
import { VerticalBlurShader } from 'three/examples/jsm/shaders/VerticalBlurShader'

const getBlurImage = (renderer, renderTarget, size, camera, name) => {
  const buffer = new Uint8Array(size * size * 4)
  renderer.readRenderTargetPixels(renderTarget, 0, 0, size, size, buffer)

  const dataTexture = new THREE.DataTexture(buffer, size, size)
  dataTexture.needsUpdate = true

  const r = new THREE.WebGLRenderer()
  r.setSize(size, size)
  r.setClearColor(0x000000)

  const scene = new THREE.Scene()
  scene.background = dataTexture
  r.render(scene, camera)
  const imgData = r.domElement.toDataURL('image/png')
  const a = document.createElement('a')
  a.href = imgData
  const timestamp = new Date(Date.now()).toISOString()
  a.setAttribute('download', `melt_${name}_blur_${timestamp}.png`)
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  r.dispose()
}

// Performs a gaussian blur on input texture and returns blurred texture
export const blur = (
  renderer,
  blurTextureSize,
  blurStrength,
  texture,
  name = ''
) => {
  if (blurStrength === 0) return texture

  console.log('Generating blur texture')

  // TO DO: set to nearest POT value below screen size
  const size = Math.min(blurTextureSize, 1024)
  const strength = THREE.MathUtils.clamp(blurStrength, 0, 20)

  let renderTargetA = new THREE.WebGLRenderTarget(size, size, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    // format: THREE.RGBAFormat,
    // encoding: THREE.sRGBEncoding,
  })
  let renderTargetB = new THREE.WebGLRenderTarget(size, size, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    // format: THREE.RGBAFormat,
    // encoding: THREE.sRGBEncoding,
  })
  const cameraBlur = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1)
  const sceneBlurA = new THREE.Scene()
  const sceneBlurB = new THREE.Scene()
  const planeA = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial(HorizontalBlurShader)
  )
  const planeB = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial(VerticalBlurShader)
  )

  planeA.material.uniforms.h.value = 1 / size
  planeB.material.uniforms.v.value = 1 / size

  sceneBlurA.add(planeA)
  sceneBlurA.add(cameraBlur)
  sceneBlurB.add(planeB)
  sceneBlurB.add(cameraBlur)

  for (let i = 0; i < strength; i++) {
    if (i === 0) planeA.material.uniforms.tDiffuse.value = texture
    else planeA.material.uniforms.tDiffuse.value = renderTargetB.texture

    renderer.setRenderTarget(renderTargetA)
    renderer.clear()
    renderer.render(sceneBlurA, cameraBlur)

    planeB.material.uniforms.tDiffuse.value = renderTargetA.texture

    renderer.setRenderTarget(renderTargetB)
    renderer.clear()
    renderer.render(sceneBlurB, cameraBlur)
  }

  renderer.setRenderTarget(null)

  planeA.geometry.dispose()
  planeB.geometry.dispose()
  planeA.material.dispose()
  planeB.material.dispose()
  sceneBlurA.remove(planeA)
  sceneBlurB.remove(planeB)

  // const blurImage = getBlurImage(
  //   renderer,
  //   renderTargetB,
  //   size,
  //   cameraBlur,
  //   name
  // )

  return renderTargetB.texture
}
