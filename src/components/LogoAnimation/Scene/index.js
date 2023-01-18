import { useState, useRef, useMemo, forwardRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree, createPortal, useLoader } from '@react-three/fiber'
import { useFBO, useTexture, PerspectiveCamera } from '@react-three/drei'

import config from '../config.json'
console.log(config)
import { useControls, button } from 'leva'

import Trail from '../Trail'

import vertexPass from './shaders/vertex'
import fragmentPass from './shaders/fragment'

import meltLogo from '../assets/textures/melt_logo.png'
import meltLogoFade from '../assets/textures/melt_logo_fade.png'

import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import warpedGlass from '../assets/models/warped_glass.obj'

import { easeInOutCubic } from '../utils'

// import Refraction from './Refraction'

// https://eriksachse.medium.com/react-three-fiber-custom-postprocessing-render-target-solution-without-using-the-effectcomposer-d3a94e6ae3c3

const Scene = forwardRef((props, ref) => {
  const cam = useRef()
  const mesh = useRef()
  const trail = useRef()
  // const scroll = useScroll()
  const group = useRef()

  const [logoConfig, setLogoConfig] = useState(config.logoSettings)
  const { displacement, refraction } = logoConfig

  // useEffect(async () => {
  //   const result = await service.getConfig()
  //   setLogoConfig(result)
  // }, [])
  // console.log(logoConfig)

  const three = useThree()
  const { size, viewport } = three

  // gl.setViewport(0, 0, size.width * gl.dpr, size.height * gl.dpr)

  // console.log(viewport)
  // // gl.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  // gl.setViewport(0, 0, size.width * viewport.dpr, size.height * viewport.dpr)
  // console.log(viewport)

  const { strength, noise, colorShift } = useControls('mouse displacement', {
    strength: {
      value: displacement.strength,
      min: 0,
      max: 1,
      step: 0.1,
      onChange: (v) => {
        mesh.current.material.uniforms.uDisp.value.x = v
      },
    },
    radius: {
      value: displacement.radius,
      min: 0,
      max: 1,
      step: 0.1,
      onChange: (v) => {
        trail.current.material.uniforms.uInfo.value.z = v
      },
    },
    decay: {
      value: displacement.decay,
      min: 0,
      max: 1,
      step: 0.1,
      onChange: (v) => {
        trail.current.material.uniforms.uInfo.value.w = v
      },
    },
    noise: {
      value: displacement.noise,
      min: 0,
      max: 2,
      step: 0.1,
      onChange: (v) => {
        mesh.current.material.uniforms.uDisp.value.y = v
      },
    },
    colorShift: {
      value: displacement.colorShift,
      min: 0,
      max: 2,
      step: 0.1,
      onChange: (v) => {
        mesh.current.material.uniforms.uDisp.value.z = v
      },
    },
  })

  const { refractionRatio, mouseSpeed, rotAngle, rotSpeed } = useControls(
    'refraction',
    {
      refractionRatio: {
        value: refraction.refractionRatio,
        min: 0,
        max: 100,
        step: 1,
        onChange: (v) => {
          data.maxRefractionRatio = 1 - v / 100
          //   // mesh.current.material.uniforms.uDisp.value.x = v
        },
      },
      mouseSpeed: {
        value: refraction.mouseSpeed,
        min: 0,
        max: 100,
        step: 1,
        onChange: (v) => {
          data.i = 0.1 * v
          // mesh.current.material.uniforms.uDisp.value.x = v
        },
      },
      // zoom: {
      //   value: refraction.zoom,
      //   min: 100,
      //   max: 200,
      //   step: 1,
      //   onChange: (v) => {
      //     // mesh.current.material.uniforms.uDisp.value.x = v
      //   },
      // },
      rotAngle: {
        value: refraction.rotAngle,
        min: 0,
        max: 360,
        step: 1,
        // onChange: (v) => {
        //   // mesh.current.material.uniforms.uDisp.value.x = v
        // },
      },
      rotSpeed: {
        value: refraction.rotSpeed,
        min: -10,
        max: 10,
        step: 0.5,
        // onChange: (v) => {
        //   // mesh.current.material.uniforms.uDisp.value.x = v
        // },
      },
    }
  )

  // const { waveEnabled, frequency, amplitude } = useControls('wave effect', {
  //   waveEnabled: {
  //     value: true,
  //     onChange: (v) => {
  //       mesh.current.material.uniforms.uWave.value.x = v
  //     },
  //   },
  //   frequency: {
  //     value: defaults.frequency,
  //     min: 0.5,
  //     max: 2,
  //     step: 0.1,
  //     onChange: (v) => {
  //       mesh.current.material.uniforms.uWave.value.y = v
  //     },
  //   },
  //   amplitude: {
  //     value: defaults.amplitude,
  //     min: 0,
  //     max: 0.5,
  //     step: 0.01,
  //     onChange: (v) => {
  //       mesh.current.material.uniforms.uWave.value.z = v
  //     },
  //   },
  // })

  // const [{ username, counter }, set] = useControls(() => ({
  //   username: 'Mario',
  //   counter: { value: 0, step: 1 },
  // }))

  // const { reset } = useControls({
  //   // perfVisible: true,
  //   reset: button(() => {
  //     set({ counter: counter + 1 })
  //   }),
  // })

  const { showMouse } = useControls('debug', {
    // perfVisible: true,
    showMouse: {
      value: false,
      onChange: (v) => {
        mesh.current.material.uniforms.uShowMouse.value = v
      },
    },
  })

  const glass = useLoader(OBJLoader, warpedGlass)
  const geometry = glass.children[0].geometry

  // https://github.com/pmndrs/drei#usefbo
  // https://codesandbox.io/s/devto-2-3rv9rf?file=/src/App.js:1022-1068
  // https://dev.to/eriksachse/create-your-own-post-processing-shader-with-react-three-fiber-usefbo-and-dreis-shadermaterial-with-ease-1i6d
  // Create target to render trail to to send plane as texture
  // Textures have max size of 2048x2048 in WebGL, therefore need to cap else won't render anything above this in some browsers (Firefox), plus to keep memory usage down, don't need 1-1 pixel quality for trail (tbc)
  // To do: maybe force tex to closest POT size up to 1028, 128, 256, 512, 1028, etc.
  // NB: WebGL2 supports non-PoT texture sizes
  const limit = 2048
  const targetSize = Math.min(
    limit,
    THREE.MathUtils.floorPowerOfTwo(Math.max(size.width, size.height))
  )
  const target = useFBO(targetSize, targetSize, {
    multisample: false,
    stencilBuffer: false,
    depthBuffer: false,
    generateMipmaps: true,
  })

  const [logoTexture, logoTextureC] = useTexture([meltLogo, meltLogoFade])

  const [scene, scene2, uniforms, cam1, mouse, data] = useMemo(() => {
    const scene = new THREE.Scene()
    const scene2 = new THREE.Scene()
    const uniforms = {
      uTime: { value: 0 },
      uResolution: {
        value: new THREE.Vector4(
          // viewport.width,
          // viewport.height,
          size.width,
          size.height,
          logoTexture.source.data.width,
          logoTexture.source.data.height
        ),
      },
      uDisp: { value: new THREE.Vector3(strength, noise, colorShift) },
      // uWave: { value: new THREE.Vector3(waveEnabled, frequency, amplitude) },
      uScene: { value: target.texture },
      uLogo: { value: logoTexture },
      uLogoC: { value: logoTextureC },
      uShowMouse: { value: showMouse },
      uTransition: { value: new THREE.Vector4(0, 0, -10, -10) },
      PI: { value: Math.PI },
      uMouse: { value: new THREE.Vector2() },
      refractionRatio: { value: 1 },
      uDPR: { value: viewport.dpr },
      // uColor: { value: new THREE.Color(0x00ff00) },
      uColor: { value: new THREE.Color(0x1b884b) },
      uFadeLast: { value: -10 },
    }

    // console.log(uniforms.uResolution)

    const data = {
      // zoom: 152,
      // refraction_ratio: 17, // 17
      // mouse_speed: 20,
      // rot_x: 90,
      // rot_y: 50,
      // rot_z: 145,
      // rot_speed_x: -9,
      // rot_speed_y: -3,
      // rot_speed_z: 3,
      aspect: viewport.width / viewport.height,
      imgAspect: 1,
      a: 0,
      i: 0.1 * mouseSpeed,
      maxRefractionRatio: 1 - refractionRatio / 100,
    }

    const mouse = {
      prev: { x: 0, y: 0, vector_length: 0 },
      current: { x: 0, y: 0, vector_length: 0 },
      smoothed_vector: 0,
      inited: false,
    }

    target.texture.minFilter = THREE.LinearFilter
    target.texture.magFilter = THREE.LinearFilter

    const cam1 = new THREE.OrthographicCamera(-1, 1, 1, -1, -100, 100)
    cam1.zoom = 1
    cam1.position.z = 0

    return [scene, scene2, uniforms, cam1, mouse, data]
  }, [])

  // Update resolution uniform on viewport resize
  useMemo(() => {
    if (mesh.current && mesh.current.material) {
      mesh.current.material.uniforms.uResolution.value.x = size.width
      mesh.current.material.uniforms.uResolution.value.y = size.height
    }

    if (cam.current && size.height < 1000) {
      cam.current.position.z = THREE.MathUtils.mapLinear(
        size.height,
        1000,
        0,
        90,
        50
      )
      cam.current.updateProjectionMatrix()
    }

    // cam2.aspect = viewport.width / viewport.height
    // cam2.updateProjectionMatrix()
  }, [viewport])

  const m = new THREE.Vector2()
  const mLast = new THREE.Vector2()

  const updateMouseMovement = () => {
    let a = {
      x: 0.9 * mouse.prev.x + 0.1 * mouse.current.x,
      y: 0.9 * mouse.prev.y + 0.1 * mouse.current.y,
    }
    a.vector_length =
      0.05 * mouse.current.vector_length + 0.95 * mouse.prev.vector_length
    mouse.smoothed_vector = a.vector_length
    mouse.prev = a
  }

  const getFadeTime = () => {
    const uFade = mesh.current.material.uniforms.uTransition.value
    const uFadeLast = mesh.current.material.uniforms.uFadeLast.value
    const uTime = mesh.current.material.uniforms.uTime.value

    if (
      (uFade.x == 0 && uFade.z == -10 && uFade.w == -10) ||
      uFade.z == uFade.w
    )
      return 0

    let fd = 3
    let fs = uFade.z
    let fe = fs + fd
    let ft = 0

    if (uFade.z - uFade.w < fd && uTime - uFade.z < fd) {
      let ts0 = uFadeLast
      if (uFade.x == 0) {
        let fd0 = ts0 * fd
        if (uTime < fs) ft = ts0
        else if (uTime < fs + fd0)
          ft = THREE.MathUtils.mapLinear(uTime, fs, fs + fd0, ts0, 0)
        else ft = 0
      } else {
        let fd0 = (1 - ts0) * fd
        if (uTime < fs) ft = ts0
        else if (uTime < fs + fd0)
          ft = THREE.MathUtils.mapLinear(uTime, fs, fs + fd0, ts0, 1)
        else ft = 1
      }
    } else {
      fe = fs + fd
      if (uTime < fs) ft = 0
      else if (uTime < fe) ft = THREE.MathUtils.mapLinear(uTime, fs, fe, 0, 1)
      else ft = 1
      if (uFade.x == 0) ft = 1 - ft
      // ft = easeInOutCubic(ft)
    }

    // ft = easeInOutCubic(ft)

    mesh.current.material.uniforms.uTransition.value.y = ft
  }

  useFrame((state, delta) => {
    if (!mouse.inited) {
      m.set(state.mouse.x, state.mouse.y)
      if (m.clone().sub(mLast).length() > 0.01) {
        mouse.inited = true
      }
      mLast.set(state.mouse.x, state.mouse.y)
    } else {
      m.set(state.mouse.x, state.mouse.y)
      mouse.current.x = m.x
      mouse.current.y = m.y

      const vector_length = m.length()
      mouse.current.vector_length =
        1 - Math.max(Math.min(2 * Math.sqrt(vector_length) - 1, 1), 0)

      updateMouseMovement()
    }

    // const dist = new THREE.Vector2(
    //   state.mouse.x - mousePrev.x,
    //   state.mouse.y - mousePrev.y
    // )

    // mousePrev.x += dist.x * delta // 0.015
    // mousePrev.y += dist.y * delta // 0.015
    // mesh.current.material.uniforms.uMouse.value = mousePrev

    // Only update if change
    // if (
    //   (scroll.visible(0, 1 / 3) &&
    //     mesh.current.material.uniforms.uTransition.value.x === 0) ||
    //   (!scroll.visible(0, 1 / 3) &&
    //     mesh.current.material.uniforms.uTransition.value.x === 1)
    // ) {
    //   mesh.current.material.uniforms.uTransition.value.x = scroll.visible(
    //     0,
    //     1 / 3
    //   )
    //     ? 1
    //     : 0
    //   mesh.current.material.uniforms.uTransition.value.z =
    //     mesh.current.material.uniforms.uTransition.value.y
    //   mesh.current.material.uniforms.uTransition.value.y =
    //     state.clock.elapsedTime
    // }

    mesh.current.material.uniforms.uTime.value += delta
    trail.current.material.uniforms.uTime.value += delta

    getFadeTime()
    // console.log(rotAngle)

    // if (rotAngle) {
    cam.current.position.x = mouse.prev.x * data.i * 0.3
    cam.current.position.y = -mouse.prev.y * data.i * 0.3
    group.current.rotation.x = -0.05 * mouse.prev.y * data.i
    group.current.rotation.y = -0.05 * mouse.prev.x * data.i
    mesh.current.rotation.x =
      289e-6 * rotSpeed.x * data.a + 0.01745 * rotAngle.x
    mesh.current.rotation.y =
      289e-6 * rotSpeed.y * data.a + 0.01745 * rotAngle.y
    mesh.current.rotation.z =
      289e-6 * rotSpeed.z * data.a + 0.01745 * rotAngle.z
    mesh.current.material.uniforms.refractionRatio.value =
      1 - (1 - data.maxRefractionRatio) * mouse.smoothed_vector
    // }

    // console.log(mouse.smoothed_vector)

    data.a += delta * 60

    state.gl.setRenderTarget(target)
    state.gl.render(scene, cam1)
    state.gl.setRenderTarget(null)

    // console.log(data.a)
  })

  return (
    <>
      {/* {perfVisible ? <Perf position="top-left" /> : null} */}

      <PerspectiveCamera
        ref={cam}
        makeDefault
        manual
        fov={20}
        aspect={viewport.width / viewport.height}
        near={1}
        far={1000}
        position={[0, 0, 90]}
      />

      {/* mouse events don't fire within portal state (creates new state (?), so need to pass root state mouse values to portal) */}
      {/* https://docs.pmnd.rs/react-three-fiber/tutorials/v8-migration-guide#createportal-creates-a-state-enclave */}
      {/* https://codesandbox.io/s/kp1w5u?file=/src/App.js */}
      {createPortal(
        <Trail
          radius={displacement.radius}
          decay={displacement.decay}
          ref={trail}
        />,
        scene,
        {
          mouse: three.mouse,
        }
      )}

      {/* {createPortal(<Refraction texture={logoTexture} camera={cam} />, scene2, {
        mouse: three.mouse,
      })} */}

      <group ref={group}>
        <mesh
          frustumCulled={true}
          position={[0, 0, 0]}
          geometry={geometry}
          scale={[1, 1, 1].map((i) => i * 55)}
          ref={mesh}
        >
          <shaderMaterial
            ref={ref}
            vertexShader={vertexPass}
            fragmentShader={fragmentPass}
            uniforms={uniforms}
          />
        </mesh>
      </group>
    </>
  )
})

export default Scene
