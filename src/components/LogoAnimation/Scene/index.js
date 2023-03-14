import { useEffect, useRef, useMemo, forwardRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree, createPortal, useLoader } from '@react-three/fiber'
import { useFBO, useTexture, PerspectiveCamera } from '@react-three/drei'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { useLeva } from './controls'
import defaultConfig from '../../helpers/LevaControls/config.json'

import Trail from './Trail'
import vertexPass from './shaders/vertex'
import fragmentPass from './shaders/fragment'

import meltLogo from '../assets/textures/melt_logo.png'
import meltLogoFade from '../assets/textures/melt_logo_fade.png'
import refractionGeometry from '../assets/models/refraction_geometry.obj'
import { blur } from '../../helpers/blurTexture'

// https://eriksachse.medium.com/react-three-fiber-custom-postprocessing-render-target-solution-without-using-the-effectcomposer-d3a94e6ae3c3

const Scene = forwardRef(
  (
    {
      fps,
      name,
      controls,
      config,
      updateConfig,
      localStorageConfig,
      updateName,
    },
    ref
  ) => {
    const cam = useRef()
    const mesh = useRef()
    const trail = useRef()
    const group = useRef()

    // const [blurStrength, setBlurStrength] = useState(2)
    // const updateBlurStrength = (value) => setBlurStrength(value)

    const three = useThree()
    const { size, viewport, gl } = three

    const defaults = controls
      ? localStorageConfig
        ? localStorageConfig
        : config
      : config

    // useEffect(() => {
    //   console.log('USEEFFECT RENDER LOGO')
    // }, [])

    const {
      upload,
      mouseArea,
      refractionRatio,
      mouseSpeed,
      rotAngle,
      rotSpeed,
    } = useLeva(name, controls, defaults, config, updateConfig, [mesh, trail])

    const texture = useTexture(
      upload === undefined || upload === null ? meltLogo : upload
    )
    const textureFade = useTexture(meltLogoFade)
    const loadedModel = useLoader(OBJLoader, refractionGeometry)
    const geometry = loadedModel.children[0].geometry

    // https://github.com/pmndrs/drei#usefbo
    // https://codesandbox.io/s/devto-2-3rv9rf?file=/src/App.js:1022-1068
    // https://dev.to/eriksachse/create-your-own-post-processing-shader-with-react-three-fiber-usefbo-and-dreis-shadermaterial-with-ease-1i6d
    // Create target to render trail to to send plane as texture
    // Textures have max size of 2048x2048 in WebGL1, therefore need to cap else won't render anything above this in some older browsers, plus to keep memory usage down, don't need 1-1 pixel quality for trail (tbc)
    // NB: WebGL2 supports non-PoT texture sizes - could check render capability
    const limit = 2048
    const targetSize = Math.min(
      limit,
      THREE.MathUtils.floorPowerOfTwo(Math.max(size.width, size.height))
    )
    const target = useFBO(targetSize, targetSize, {
      multisample: false,
      stencilBuffer: false,
      depthBuffer: false,
    })
    target.texture.minFilter = THREE.LinearFilter
    target.texture.magFilter = THREE.LinearFilter

    const m = new THREE.Vector2()
    const mLast = new THREE.Vector2()

    const [scene, uniforms, camera, mouse] = useMemo(() => {
      const scene = new THREE.Scene()

      const uniforms = {
        uTime: { value: 0 },
        uResolution: {
          value: new THREE.Vector4(),
        },
        uDisp: {
          value: new THREE.Vector3(1, 1, 1),
        },
        uScene: { value: null },
        uLogo: { value: null },
        uLogoC: { value: null },
        uImageScale: { value: 1 },
        uShowMouse: { value: false },
        uNormal: { value: false },
        uTransition: { value: new THREE.Vector4(0, 0, -10, -10) },
        uRefractionRatio: { value: 1 },
        uDPR: { value: 1 },
        uFadeLast: { value: -10 },
        uControls: { value: 0 },
        PI: { value: Math.PI },
      }

      const mouse = {
        prev: { x: 0, y: 0, vectorLength: 0 },
        current: { x: 0, y: 0, vectorLength: 0 },
        smoothedVector: 0,
        inited: false,
      }

      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1)

      return [scene, uniforms, camera, mouse]
    }, [])

    useEffect(() => {
      if (mesh.current && mesh.current.material) {
        mesh.current.material.uniforms.uControls.value = controls ? 1 : 0
      }
    }, [controls])

    useEffect(() => {
      if (mesh.current && mesh.current.material) {
        mesh.current.material.uniforms.uDPR.value = viewport.dpr
        mesh.current.material.needsUpdate = true
      }
    }, [viewport])

    useEffect(() => {
      const { displacementStrength, colorNoise, colorShift } = defaults

      if (mesh.current && mesh.current.material) {
        mesh.current.material.uniforms.uDisp.value.x = displacementStrength
        mesh.current.material.uniforms.uDisp.value.y = colorNoise
        mesh.current.material.uniforms.uDisp.value.z = colorShift

        mesh.current.material.needsUpdate = true
      }
    }, [defaults])

    useEffect(() => {
      if (mesh.current && mesh.current.material) {
        mesh.current.material.uniforms.uScene.value = target.texture
      }
    }, [target])

    useEffect(() => {
      if (mesh.current && mesh.current.material) {
        mesh.current.material.uniforms.uLogo.value = texture
        // console.log(texture.source.data.width)

        if (
          !controls ||
          (controls && upload === null) ||
          upload === undefined
        ) {
          mesh.current.material.uniforms.uLogoC.value = textureFade
        } else {
          const blurTexture = blur(gl, 1024, 20, texture)
          mesh.current.material.uniforms.uLogoC.value = blurTexture
        }

        mesh.current.material.uniforms.uResolution.value.z =
          texture.source.data.width
        mesh.current.material.uniforms.uResolution.value.w =
          texture.source.data.height
        mesh.current.material.needsUpdate = true
      }
    }, [texture, textureFade, controls, upload, gl])

    // Handle viewport changes
    useEffect(() => {
      if (mesh.current && mesh.current.material) {
        mesh.current.material.uniforms.uResolution.value.x = size.width
        mesh.current.material.uniforms.uResolution.value.y = size.height
      }

      if (trail.current && trail.current.material) {
        trail.current.material.uniforms.uResolution.value.x = size.width
        trail.current.material.uniforms.uResolution.value.y = size.height
      }

      // Update camera position for narrow and tall screens
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
    }, [size])

    useEffect(() => {
      if (!controls) {
        const { metric, value } = defaultConfig.devices.mobile
        if (size[metric] < value && name !== 'logo-mobile')
          updateName('logo-mobile')
        else if (size[metric] >= value && name !== 'logo') updateName('logo')
      }
    }, [size, updateName, controls, name])

    const updateMouseMovement = () => {
      let a = {
        x: 0.9 * mouse.prev.x + 0.1 * mouse.current.x,
        y: 0.9 * mouse.prev.y + 0.1 * mouse.current.y,
      }
      a.vectorLength =
        0.05 * mouse.current.vectorLength + 0.95 * mouse.prev.vectorLength
      mouse.smoothedVector = a.vectorLength
      mouse.prev = a
    }

    const clampMouseMovement = () => {
      if (
        mouse.current.vectorLength <
        THREE.MathUtils.clamp(1 - mouseArea, 0, 0.99)
      ) {
        mouse.current.vectorLength = 0
      } else {
        mouse.current.vectorLength = THREE.MathUtils.mapLinear(
          mouse.current.vectorLength,
          THREE.MathUtils.clamp(1 - mouseArea, 0, 0.99),
          1,
          0,
          1
        )
      }
    }

    const updateMouse = (state) => {
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

        const vectorLength = m.length()
        mouse.current.vectorLength =
          1 - Math.max(Math.min(2 * Math.sqrt(vectorLength) - 1, 1), 0)

        clampMouseMovement()
        updateMouseMovement()
      }
    }

    const getFadeTime = () => {
      // uTransition.x === stage (0 == not faded, 1 == faded) -> need way to detect if canvas out of view/completely faded

      if (!mesh.current || !mesh.current.material) return

      const uFade = mesh.current.material.uniforms.uTransition.value
      const uFadeLast = mesh.current.material.uniforms.uFadeLast.value
      const uTime = mesh.current.material.uniforms.uTime.value

      if (
        (uFade.x === 0 && uFade.z === -10 && uFade.w === -10) ||
        uFade.z === uFade.w
      )
        return 0

      let fd = 3
      let fs = uFade.z
      let fe = fs + fd
      let ft = 0

      if (uFade.z - uFade.w < fd && uTime - uFade.z < fd) {
        let ts0 = uFadeLast
        if (uFade.x === 0) {
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
        if (uFade.x === 0) ft = 1 - ft
      }

      mesh.current.material.uniforms.uTransition.value.y = ft
    }

    const animate = (delta) => {
      // let length = trail.current.material.uniforms.uLength.value
      // length = THREE.MathUtils.clamp(length, 0, 2)
      // const lf = 1 - length / 2
      let totalDelta = 0

      if (mesh.current && mesh.current.material) {
        mesh.current.material.uniforms.uTime.value += delta
        totalDelta = mesh.current.material.uniforms.uTime.value * 60
        mesh.current.material.uniforms.uRefractionRatio.value =
          1 - refractionRatio * mouse.smoothedVector * 0.01

        mesh.current.rotation.x =
          0.0003 * rotSpeed.x * totalDelta + 0.0175 * rotAngle.x
        mesh.current.rotation.y =
          0.0003 * rotSpeed.y * totalDelta + 0.0175 * rotAngle.y
        mesh.current.rotation.z =
          0.0003 * rotSpeed.z * totalDelta + 0.0175 * rotAngle.z
      }

      if (cam.current) {
        cam.current.position.x = mouse.prev.x * (mouseSpeed * 0.1) * 0.3
        cam.current.position.y = -mouse.prev.y * (mouseSpeed * 0.1) * 0.3
      }

      if (group.current) {
        group.current.rotation.x = -0.05 * mouse.prev.y * (mouseSpeed * 0.1)
        group.current.rotation.y = -0.05 * mouse.prev.x * (mouseSpeed * 0.1)
      }
    }

    useFrame((state, delta) => {
      updateMouse(state)
      animate(delta)
      getFadeTime()

      // const el = document.querySelector('.project')
      // if (el) {
      //   const rect = el.getBoundingClientRect()
      //   // console.log(rect.top < window.innerHeight / 2)

      //   let stage = rect.top < window.innerHeight / 2 ? 1 : 0

      //   if (mesh.current) {
      //     if (mesh.current.material.uniforms.uTransition.value.x !== stage) {
      //       const { uTransition, uTime, uFadeLast } =
      //         mesh.current.material.uniforms
      //       uFadeLast.value = uTransition.value.y
      //       uTransition.value.x = stage
      //       uTransition.value.w = uTransition.value.z
      //       uTransition.value.z = uTime.value
      //     }
      //   }
      // }

      state.gl.setRenderTarget(target)
      state.gl.clear()
      state.gl.render(scene, camera)
      state.gl.setRenderTarget(null)
    })

    return (
      <>
        <PerspectiveCamera
          ref={cam}
          makeDefault
          manual
          fov={20}
          aspect={viewport.width / viewport.height}
          near={50}
          far={200}
          position={[0, 0, 90]}
        />

        {/* mouse events don't fire within portal state so need to pass root state mouse values */}
        {/* https://docs.pmnd.rs/react-three-fiber/tutorials/v8-migration-guide#createportal-creates-a-state-enclave */}
        {/* https://codesandbox.io/s/kp1w5u?file=/src/App.js */}
        {createPortal(<Trail fps={fps} ref={trail} />, scene, {
          mouse: three.mouse,
        })}

        <group ref={group}>
          <mesh
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
              side={THREE.FrontSide}
              wireframe={false}
              transparent={true}
              toneMapped={false}
            />
          </mesh>
        </group>
      </>
    )
  }
)

Scene.displayName = 'Scene'

export default Scene
