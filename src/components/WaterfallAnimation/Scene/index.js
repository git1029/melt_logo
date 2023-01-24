import { useEffect, useRef, useMemo, useState } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { OrthographicCamera, useTexture } from '@react-three/drei'

import defaultConfig from '../config/config.json'
import { setupConfig } from '../../helpers/LevaControls/setupConfig'
import { useLeva } from '../config/controls'

import vertexShader from './shaders/vertex'
import fragmentShader from './shaders/fragment'

import meltLogo from '../assets/textures/melt_logo.png'
import smiley from '../assets/textures/smiley.png'
import noise from '../assets/textures/noise.png'

import { blur } from '../../helpers/blurTexture'

const Scene = ({ controls }) => {
  const mesh = useRef()

  const [blurStrength, setBlurStrength] = useState(2)
  const updateBlurStrength = (value) => setBlurStrength(value)

  const imageOptions = { smiley, melt: meltLogo }

  const { gl, size, viewport } = useThree()

  // const config = defaultConfig
  const [config, setConfig] = useState(defaultConfig)
  const useServerConfig = true

  useEffect(() => {
    console.log('RENDER SCENE')
    setupConfig(
      'waterfall',
      defaultConfig,
      useServerConfig,
      updateConfig,
      updateStore,
      controls
    )
  }, [])

  const updateConfig = (newConfig) => setConfig(newConfig)

  const { image, upload, updateStore } = useLeva(
    controls,
    config,
    updateConfig,
    useServerConfig,
    [mesh, updateBlurStrength, imageOptions]
  )

  const [texture, noiseTexture] = useTexture([
    upload === undefined || upload === null ? image : upload,
    noise,
  ])

  // Get blurred image for color effect
  // Only run on load or if new image uploaded (debug mode only)
  // On live site should be a pre-made texture uploaded
  const blurTexture = useMemo(() => {
    const blurTexture = blur(gl, 1024, blurStrength, texture, 'waterfall')

    return blurTexture
  }, [texture, blurStrength])

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
    // const distance = new THREE.Vector2()

    const uniforms = {
      uImage: { value: blurTexture },
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

  useEffect(() => {
    mesh.current.material.uniforms.uImage.value = blurTexture
    mesh.current.material.needsUpdate = true
  }, [blurTexture])

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
