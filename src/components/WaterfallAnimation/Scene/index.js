import { useEffect, useRef, useMemo, useState } from 'react'
import * as THREE from 'three'
// import { useControls, folder, button, levaStore } from 'leva'
import { useFrame, useThree } from '@react-three/fiber'
import { OrthographicCamera, useTexture } from '@react-three/drei'

// import { downloadConfig } from '../../helpers/LevaControls/downloadConfig'

import { useLeva } from './controls'

// import { useLeva } from '../config/controls'

import vertexShader from './shaders/vertex'
import fragmentShader from './shaders/fragment'

import meltLogo from '../assets/textures/melt_logo.png'
import smiley from '../assets/textures/smiley.png'
import noise from '../assets/textures/noise.png'

import { blur } from '../../helpers/blurTexture'

const Scene = ({
  name,
  controls,
  config,
  updateConfig,
  localStorageConfig,
  canvasRef,
}) => {
  const mesh = useRef()

  const [blurStrength, setBlurStrength] = useState(2)
  const updateBlurStrength = (value) => setBlurStrength(value)

  const imageOptions = { melt: meltLogo, smiley }

  const { size, gl } = useThree()

  const defaults = controls
    ? localStorageConfig
      ? localStorageConfig
      : config
    : config

  // console.log('RENDER WATERFALL')

  // useEffect(() => {
  //   console.log('USEEFFECT RENDER WATERFALL')
  // }, [])

  const { upload, image } = useLeva(
    name,
    controls,
    defaults, // localStorage (if controls) > snippet > base
    config, // snippet > base
    updateConfig,
    [mesh, imageOptions, updateBlurStrength]
  )

  // Set texture source if upload/image undefined (if controls disabled)
  // TODO: add API get texture from server
  const textureSource = () => {
    if (upload !== undefined && upload !== null) {
      return upload
    }

    if (image !== undefined && image !== null) {
      return image
    }

    return meltLogo
  }

  const texture = useTexture(textureSource())
  // NB: split noiseTexture else any textureSource change will reload noiseTexture (which will create new uniform)
  const noiseTexture = useTexture(noise)

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
    const mouse = new THREE.Vector2()

    const uniforms = {
      uImage: { value: null },
      uColor: { value: new THREE.Color(0xffffff) },
      uTime: { value: 0 },
      uResolution: {
        value: new THREE.Vector4(0, 0, 1024, 1024),
      },
      PI: { value: Math.PI },
      uLine: {
        value: new THREE.Vector4(20, 1, 0.5, 0.5),
      },
      uDistortion: {
        value: new THREE.Vector4(0.5, 0.5, true, 1),
      },
      uMouse: { value: mouse },
      uNoise: { value: null },
      uTransition: { value: new THREE.Vector4(0, 0, 3, 7) },
    }

    return [uniforms, mouse]
  }, [])

  useEffect(() => {
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
    } = defaults

    mesh.current.material.uniforms.uLine.value.x = lineCount
    mesh.current.material.uniforms.uLine.value.y = lineSpeed
    mesh.current.material.uniforms.uLine.value.z = lineWidth
    mesh.current.material.uniforms.uLine.value.w = colorShift

    mesh.current.material.uniforms.uDistortion.value.x = imageStrength
    mesh.current.material.uniforms.uDistortion.value.y = lineDistortion
    mesh.current.material.uniforms.uDistortion.value.z = mouseEnabled
    mesh.current.material.uniforms.uDistortion.value.w = mouseStrength

    mesh.current.material.uniforms.uColor.value = new THREE.Color(lineColor)

    mesh.current.material.needsUpdate = true
  }, [defaults])

  // useEffect(() => {
  //   mesh.current.material.uniforms.uImage.value = blurTexture
  //   mesh.current.material.needsUpdate = true
  // }, [blurTexture])

  useEffect(() => {
    mesh.current.material.uniforms.uNoise.value = noiseTexture
    mesh.current.material.needsUpdate = true
  }, [noiseTexture])

  // useEffect(() => {
  //   mesh.current.material.uniforms.uImage.value = texture
  //   mesh.current.material.needsUpdate = true
  // }, [texture])

  useEffect(() => {
    if (mesh.current && mesh.current.material) {
      if (!controls || (controls && upload === null) || upload === undefined) {
        mesh.current.material.uniforms.uImage.value = texture
      } else {
        const blurTexture = blur(gl, 1024, blurStrength, texture)

        mesh.current.material.uniforms.uImage.value = blurTexture
      }

      mesh.current.material.needsUpdate = true

      // mesh.current.material.uniforms.uResolution.value.z = texture.width
      // mesh.current.material.uniforms.uResolution.value.w = texture.height
      // mesh.current.material.needsUpdate = true
    }
  }, [texture, controls, upload, gl, blurStrength])

  // Update resolution uniform on viewport resize
  useEffect(() => {
    if (mesh.current && mesh.current.material) {
      mesh.current.material.uniforms.uResolution.value.x = size.width
      mesh.current.material.uniforms.uResolution.value.y = size.height
    }
  }, [size])

  useFrame((state, delta) => {
    mesh.current.material.uniforms.uTime.value += delta

    mouse.x += (state.mouse.x - mouse.x) * delta * 5
    mouse.y += (state.mouse.y - mouse.y) * delta * 5

    mesh.current.material.uniforms.uMouse.value.set(mouse.x, mouse.y)

    if (!controls) handleFadeOut()
  })

  const handleFadeOut = () => {
    const time = mesh.current.material.uniforms.uTime.value
    const t = mesh.current.material.uniforms.uTransition.value.w
    if (mesh.current.material.uniforms.uTransition.value.x === 0 && time > t) {
      mesh.current.material.uniforms.uTransition.value.x = 1
      mesh.current.material.uniforms.uTransition.value.y = time

      // console.log(
      //   mesh.current.material.uniforms.uTransition.value.x,
      //   mesh.current.material.uniforms.uTransition.value.y
      // )
    }

    if (canvasRef.current) {
      if (time > t + 3.5 && canvasRef.current.style.display === 'block') {
        canvasRef.current.style.display = 'none'
        // console.log(time)
        // console.log('hide canvas')
      }
    }
  }

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

      <mesh
        ref={mesh}
        onClick={() => {
          const time = mesh.current.material.uniforms.uTime.value
          const tmin = mesh.current.material.uniforms.uTransition.value.z
          const tmax = mesh.current.material.uniforms.uTransition.value.w
          if (time >= tmin && time < tmax) {
            mesh.current.material.uniforms.uTransition.value.w = time
          }
        }}
      >
        <planeGeometry args={[2, 2]} />
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent={true}
          // wireframe={true}
        />
      </mesh>
    </>
  )
}

export default Scene
