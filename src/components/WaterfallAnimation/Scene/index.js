import { useEffect, useRef, useMemo, useLayoutEffect } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { OrthographicCamera, useTexture } from '@react-three/drei'
import { useControls, button, folder, levaStore } from 'leva'

import waterfallConfig from '../config.json'

import vertexShader from './shaders/vertex'
import fragmentShader from './shaders/fragment'

import meltLogo from '../assets/textures/melt_logo.png'
import smiley from '../assets/textures/smiley.png'
import noise from '../assets/textures/noise.png'

import { downloadConfig } from '../utils'

const Scene = () => {
  const mesh = useRef()

  const { gl, size, viewport } = useThree()

  const { config } = waterfallConfig

  useEffect(() => {
    // const fetchConfig = async () => {
    //   const data = await waterfallService.getConfig()
    //   setConfig(data)
    // }
    // fetchConfig()
    // console.log('RENDER SCENE')
  }, [])

  const store = levaStore.useStore()

  const { image, upload } = useControls({
    lines: folder(
      {
        lineCount: {
          label: 'count',
          value: config.lineCount,
          min: 1,
          max: 50,
          step: 1,
          onChange: (v) => {
            mesh.current.material.uniforms.uLine.value.x = v
          },
        },
        lineSpeed: {
          label: 'speed',
          value: config.lineSpeed,
          min: 0,
          max: 3,
          step: 0.1,
          onChange: (v) => {
            mesh.current.material.uniforms.uLine.value.y = v
          },
        },
        lineWidth: {
          label: 'width',
          value: config.lineWidth,
          min: 0,
          max: 1,
          step: 0.01,
          onChange: (v) => {
            mesh.current.material.uniforms.uLine.value.z = v
          },
        },
        lineDistortion: {
          label: 'distortion',
          value: config.lineDistortion,
          min: 0,
          max: 1,
          step: 0.01,
          onChange: (v) => {
            mesh.current.material.uniforms.uDistortion.value.y = v
          },
        },
        lineColor: {
          label: 'color',
          value: config.lineColor,
          onChange: (v) => {
            mesh.current.material.uniforms.uColor.value = new THREE.Color(v)
          },
        },
        colorShift: {
          label: 'col shift',
          value: config.colorShift,
          min: 0,
          max: 1,
          step: 0.01,
          onChange: (v) => {
            mesh.current.material.uniforms.uLine.value.w = v
          },
        },
      },
      { order: 1 }
    ),
    mouse: folder(
      {
        mouseEnabled: {
          label: 'enabled',
          value: config.mouseEnabled,
          onChange: (v) => {
            mesh.current.material.uniforms.uDistortion.value.z = v
          },
        },
        mouseStrength: {
          label: 'strength',
          value: config.mouseStrength,
          min: 0,
          max: 1,
          step: 0.01,
          onChange: (v) => {
            mesh.current.material.uniforms.uDistortion.value.w = v
          },
        },
      },
      { order: 2 }
    ),
    image: folder(
      {
        image: {
          options: { smiley, melt: meltLogo },
        },
        upload: {
          image: null,
        },
        imageStrength: {
          label: 'strength',
          value: config.imageStrength,
          min: 0,
          max: 1,
          step: 0.01,
          onChange: (v) => {
            mesh.current.material.uniforms.uDistortion.value.x = v
          },
        },
      },
      { order: 3 }
    ),
    debug: folder(
      {
        showCursor: {
          label: 'cursor',
          value: true,
          onChange: (v) => {
            document.body.style.cursor = v ? 'default' : 'none'
          },
        },
        'export settings': button(() => {
          const data = store.data
          const keys = Object.keys(data)
          const newConfig = { ...config }

          keys.forEach((key) => {
            const k = key.split('.').pop()
            if (newConfig[k]) {
              newConfig[k] = data[key].value
            }
          })

          downloadConfig(JSON.stringify({ config: newConfig }))
        }),
      },
      { order: 5 }
    ),
  })

  const texture = useTexture(
    upload === undefined || upload === null ? image : upload
  )

  const noiseTexture = useTexture(noise)

  useLayoutEffect(() => {
    mesh.current.material.uniforms.uImage.value = texture
  }, [texture])

  const [imageData] = useMemo(() => {
    const scene = new THREE.Scene()

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10)
    scene.add(camera)

    const limit = 1024
    const targetSize = Math.min(
      limit,
      THREE.MathUtils.floorPowerOfTwo(Math.max(size.width, size.height))
    )
    const target = new THREE.WebGLRenderTarget(targetSize, targetSize, {
      multisample: false,
      stencilBuffer: false,
      depthBuffer: false,
    })

    texture.flipY = false
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.MeshBasicMaterial({
        map: texture,
      })
    )
    scene.add(plane)

    gl.setRenderTarget(target)
    gl.render(scene, camera)

    // Bug with writing tex image to canvas and using getimageData in Firefox as color space values interpreted differently/wrong, so write tex to plane and use render target texture instead to get correct values
    const buffer = new Uint8Array(targetSize * targetSize * 4)
    gl.readRenderTargetPixels(target, 0, 0, targetSize, targetSize, buffer)

    const imageData = {
      data: buffer,
      width: targetSize,
      height: targetSize,
    }

    gl.setRenderTarget(null)

    plane.geometry.dispose()
    plane.material.dispose()
    scene.remove(plane)

    return [imageData]
  }, [texture])

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
      uImage: { value: texture },
      uColor: { value: new THREE.Color(lineColor) },
      uTime: { value: 0 },
      uResolution: {
        value: new THREE.Vector4(
          size.width,
          size.height,
          imageData.width,
          imageData.height
        ),
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

  // Update resolution uniform on viewport resize
  useMemo(() => {
    if (mesh.current && mesh.current.material) {
      mesh.current.material.uniforms.uResolution.value.x = size.width
      mesh.current.material.uniforms.uResolution.value.y = size.height
    }
  }, [viewport])

  // On each frame
  useFrame((state, delta) => {
    mesh.current.material.uniforms.uTime.value += delta

    // distance.x = state.mouse.x - mouse.x
    // distance.y = state.mouse.y - mouse.y

    mouse.x += (state.mouse.x - mouse.x) * delta * 5
    mouse.y += (state.mouse.y - mouse.y) * delta * 5

    mesh.current.material.uniforms.uMouse.value.set(
      // state.mouse.x,
      // state.mouse.y
      mouse.x,
      mouse.y
    )

    // mesh.current.material.uniforms.uDist.value.set(
    //   distance.x,
    //   distance.y
    // )
  })

  return (
    <>
      {/* "background" is the scene that invisbly wraps this tag */}
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
