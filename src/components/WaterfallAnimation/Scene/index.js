import { useState, useRef, useMemo, useLayoutEffect } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { OrthographicCamera, useTexture } from '@react-three/drei'

import config from '../config.json'
import { useControls } from 'leva'

import vertexShader from './shaders/vertex'
import fragmentShader from './shaders/fragment'

import meltLogo from '../assets/textures/melt_logo.png'
import smiley from '../assets/textures/smiley.png'

const Scene = () => {
  const mesh = useRef()

  const [waterfallConfig, setWaterfallConfig] = useState(
    config.waterfallSettings
  )

  const { gl, size, viewport } = useThree()

  const { lineCount, lineSpeed, lineWidth, colorOff, distortion } = useControls(
    'lines',
    {
      lineCount: {
        value: waterfallConfig.lines.count,
        min: 1,
        max: 50,
        step: 1,
        onChange: (v) => {
          mesh.current.material.uniforms.uLine.value.x = v
        },
      },
      lineSpeed: {
        value: waterfallConfig.lines.speed,
        min: 0,
        max: 3,
        step: 0.1,
        onChange: (v) => {
          mesh.current.material.uniforms.uLine.value.y = v
        },
      },
      lineWidth: {
        value: waterfallConfig.lines.width,
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (v) => {
          mesh.current.material.uniforms.uLine.value.z = v
        },
      },
      colorOff: {
        value: waterfallConfig.lines.colorOff,
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (v) => {
          mesh.current.material.uniforms.uLine.value.w = v
        },
      },
      distortion: {
        value: waterfallConfig.lines.distortion,
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (v) => {
          mesh.current.material.uniforms.uDistortion.value.y = v
        },
      },
    }
  )

  const { mouseEnabled, mouseStrength } = useControls('mouse', {
    mouseEnabled: {
      value: waterfallConfig.mouse.enabled,
      onChange: (v) => {
        mesh.current.material.uniforms.uDistortion.value.z = v
      },
    },
    mouseStrength: {
      value: waterfallConfig.mouse.strength,
      min: 0,
      max: 1,
      step: 0.01,
      onChange: (v) => {
        mesh.current.material.uniforms.uDistortion.value.w = v
      },
    },
  })

  const { image, upload, strength } = useControls('image', {
    image: {
      options: { smiley, melt: meltLogo },
    },
    upload: {
      image: null,
    },
    strength: {
      value: waterfallConfig.image.strength,
      min: 0,
      max: 1,
      step: 0.01,
      onChange: (v) => {
        mesh.current.material.uniforms.uDistortion.value.x = v
      },
    },
  })

  const texture = useTexture(
    upload === undefined || upload === null ? image : upload
  )

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
    const mouse = new THREE.Vector2()

    const uniforms = {
      uImage: { value: texture },
      // uColor: { value: new THREE.Color(background) },
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
        value: new THREE.Vector4(lineCount, lineSpeed, lineWidth, colorOff),
      },
      uDistortion: {
        value: new THREE.Vector4(
          strength,
          distortion,
          mouseEnabled,
          mouseStrength
        ),
      },
      uMouse: { value: new THREE.Vector2() },
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

    mouse.x += (state.mouse.x - mouse.x) * delta * 5
    mouse.y += (state.mouse.y - mouse.y) * delta * 5

    mesh.current.material.uniforms.uMouse.value.set(
      // state.mouse.x,
      // state.mouse.y
      mouse.x,
      mouse.y
    )
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
