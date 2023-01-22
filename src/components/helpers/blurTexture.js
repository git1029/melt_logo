import * as THREE from 'three'
import { HorizontalBlurShader } from 'three/examples/jsm/shaders/HorizontalBlurShader'
import { VerticalBlurShader } from 'three/examples/jsm/shaders/VerticalBlurShader'

// Performs a gaussian blur on input texture and returns blurred texture
export const blur = (renderer, blurTextureSize, blurStrength, texture) => {
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

  return renderTargetB.texture
}
