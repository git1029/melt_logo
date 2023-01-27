import { useEffect, useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { OrthographicCamera, useTexture } from '@react-three/drei'

import { getLocalStorageConfig } from '../../helpers/LevaControls/setupConfig'
import { useLeva } from '../config/controls'

import vertexShader from './shaders/vertex'
import fragmentShader from './shaders/fragment'

import meltLogo from '../assets/textures/melt_logo.png'
import smiley from '../assets/textures/smiley.png'
import noise from '../assets/textures/noise.png'

// import { blur } from '../../helpers/blurTexture'

const Scene = ({ controls, config, updateConfig }) => {
  const mesh = useRef()

  // const [blurStrength, setBlurStrength] = useState(2)
  // const updateBlurStrength = (value) => setBlurStrength(value)

  const imageOptions = { smiley, melt: meltLogo }

  const { size, viewport } = useThree()

  useEffect(() => {
    // console.log('RENDER SCENE')

    updateStore(config)
    if (controls) {
      const localStorageConfig = getLocalStorageConfig('waterfall')
      if (localStorageConfig) updateStore(localStorageConfig)
    }
  }, [controls])

  const { image, updateStore } = useLeva(controls, config, updateConfig, [
    mesh,
    // updateBlurStrength,
    imageOptions,
  ])

  // Set texture source if upload/image undefined (if controls disabled)
  // TODO: add API get texture from server
  const textureSource = () => {
    // if (upload !== undefined && upload !== null) {
    //   return upload
    // }

    if (image !== undefined && image !== null) {
      return image
    }

    return smiley
  }

  const [texture, noiseTexture] = useTexture([textureSource(), noise])

  // // Get blurred image for color effect
  // // Only run on load or if new image uploaded (debug mode only)
  // // On live site should be a pre-made texture uploaded
  // const blurTexture = useMemo(() => {
  //   let blurTexture = texture

  //   // if (controls) {
  //   //   blurTexture = blur(gl, 1024, blurStrength, texture, 'waterfall')
  //   // }

  //   return blurTexture
  // }, [controls, texture, blurStrength])

  const [uniforms, mouse] = useMemo(() => {
    const {
      lineCount,
      lineSpeed,
      lineWidth,
      lineDistortion,
      lineColor,
      colorShift,
      mouseEnabled,
      mouseStrength,
      imageStrength,
    } = config

    const mouse = new THREE.Vector2()

    const uniforms = {
      uImage: { value: texture },
      uColor: { value: new THREE.Color(lineColor) },
      uTime: { value: 0 },
      uResolution: {
        value: new THREE.Vector4(size.width, size.height, 1024, 1024),
      },
      PI: { value: Math.PI },
      uLine: {
        value: new THREE.Vector4(lineCount, lineSpeed, lineWidth, colorShift),
      },
      uDistortion: {
        value: new THREE.Vector4(
          imageStrength,
          lineDistortion,
          mouseEnabled,
          mouseStrength
        ),
      },
      uMouse: { value: mouse },
      uNoise: { value: noiseTexture },
      // uDist: { value: distance },
    }

    return [uniforms, mouse]
  }, [])

  // const updateUniforms = () => {
  //   uniforms.uColor.value = new THREE.Color(config.lineColor)
  //   uniforms.uLine.value.x = config.lineCount
  //   uniforms.uLine.value.y = config.lineSpeed
  //   uniforms.uLine.value.z = config.lineWidth
  //   uniforms.uLine.value.w = config.colorShift
  //   uniforms.uDistortion.value.x = config.imageStrength
  //   uniforms.uDistortion.value.y = config.lineDistortion
  //   uniforms.uDistortion.value.z = config.mouseEnabled
  //   uniforms.uDistortion.value.w = config.mouseStrength
  // }

  // // Need to update
  // useEffect(() => {
  //   console.log('updating uniforms')
  //   updateUniforms()
  // }, [controls])

  // useEffect(() => {
  //   mesh.current.material.uniforms.uImage.value = blurTexture
  //   mesh.current.material.needsUpdate = true
  // }, [blurTexture])

  useEffect(() => {
    mesh.current.material.uniforms.uImage.value = texture
    mesh.current.material.needsUpdate = true
  }, [texture])

  // Update resolution uniform on viewport resize
  useEffect(() => {
    if (mesh.current && mesh.current.material) {
      mesh.current.material.uniforms.uResolution.value.x = size.width
      mesh.current.material.uniforms.uResolution.value.y = size.height
    }
  }, [viewport])

  useFrame((state, delta) => {
    mesh.current.material.uniforms.uTime.value += delta

    mouse.x += (state.mouse.x - mouse.x) * delta * 5
    mouse.y += (state.mouse.y - mouse.y) * delta * 5

    mesh.current.material.uniforms.uMouse.value.set(mouse.x, mouse.y)
  })

  return (
    <>
      {/* <color args={[background]} attach="background" /> */}

      <OrthographicCamera
        makeDefault
        left={-1}
        right={1}
        top={1}
        bottom={-1}
        near={-1}
        far={1}
        manual
      />

      <mesh ref={mesh}>
        <planeGeometry args={[2, 2]} />
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          // wireframe={true}
        />
      </mesh>
    </>
  )
}

export default Scene
