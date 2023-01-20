import * as THREE from 'three'
import { useMemo, useState, forwardRef, useEffect, useRef } from 'react'
import { createPortal, useFrame, useThree } from '@react-three/fiber'
import { useFBO } from '@react-three/drei'

import positionsVertexShader from './shaders/positionsVertex.js'
import positionsFragmentShader from './shaders/positionsFragment.js'
import vertexShader from './shaders/vertex.js'
import fragmentShader from './shaders/fragment.js'

import { easeInOutCubic } from '../utils.js'

const TrailTest = forwardRef(({ radius, decay }, ref) => {
  const tmp = new THREE.Vector2()
  const sim = useRef()

  const { viewport } = useThree()

  const [loaded, setLoaded] = useState(false)
  const [mousePoints, setMousePoints] = useState(false)

  const pointCount = 1000
  const limit = 512
  const size = Math.min(
    limit,
    THREE.MathUtils.ceilPowerOfTwo(Math.sqrt(pointCount))
  )

  const target = useFBO(size, size, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat,
    type: THREE.FloatType,
    // multisample: false,
    // stencilBuffer: false,
    // depthBuffer: false,
    // generateMipmaps: false,
  })

  const [
    points,
    position,
    positionsTexture,
    data,
    // index,
    positionsUniforms,
    trailUniforms,
    scene,
    camera,
  ] = useMemo(() => {
    const points = []
    for (let i = 0; i < pointCount; i++) {
      points.push(
        new THREE.Vector2(
          Math.sin((i / pointCount) * Math.PI * 0.9) * 0.5,
          Math.cos((i / pointCount) * Math.PI * 0.9) * 0.5
        )
      )
    }

    const data = new Float32Array(size * size * 4)
    const position = new Float32Array(pointCount * 3)
    // const index = new Uint16Array((pointCount - 1) * 3 * 2)

    for (let i = 0; i < pointCount; i++) {
      points[i].toArray(data, i * 4)
      data[i * 4 + 2] = i // index in datatexture
      data[i * 4 + 3] = 0

      // Vertex shader will draw each vertice by order in position array
      // Want to draw point closest to mouse last so it is drawn on top (using transparency means z pos is ignored)
      // Therefore we draw position into array in reverse
      let i3 = (pointCount - i - 1) * 3
      position[i3 + 0] = (i % size) / size
      position[i3 + 1] = i / size / size

      // if (i === pointCount - 1) continue
      // const ind = i * 2
      // index.set([ind + 0, ind + 1, ind + 2], (ind + 0) * 3)
      // index.set([ind + 2, ind + 1, ind + 3], (ind + 1) * 3)
    }

    const positionsTexture = new THREE.DataTexture(
      data,
      size,
      size,
      THREE.RGBAFormat,
      THREE.FloatType
    )
    positionsTexture.needsUpdate = true

    const positionsUniforms = {
      positions: { value: positionsTexture },
      uMouse: { value: new THREE.Vector2() },
      uTime: { value: 0 },
    }

    const trailUniforms = {
      positions: { value: null },
      uTime: { value: 0 },
      uSize: { value: size },
      uInfo: { value: new THREE.Vector4(pointCount, 200, radius, decay) },
      uDisplay: { value: 0 },
      resolution: {
        value: new THREE.Vector2(viewport.width, viewport.height),
      },
    }

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1)

    return [
      points,
      position,
      positionsTexture,
      data,
      // index,
      positionsUniforms,
      trailUniforms,
      scene,
      camera,
    ]
  }, [])

  const updatePoints = (mouse, delta) => {
    // Couldn't move position update to GPU as points need to be updated serially rather than all at same time (as need next points updated position)
    // TO DO: consistent update across diff FPS
    // for (let j = 0; j < pointCount / 100; j++) {
    for (let i = points.length - 1; i >= 0; i--) {
      if (i === 0) {
        tmp.copy(mouse).sub(points[i])
        points[i].add(tmp)
      } else {
        // let t = i / points.length
        // t = easeInOutCubic(t)
        // t = THREE.MathUtils.mapLinear(t, 0, 1, 0.5, 0.75)
        // // t = 1
        // points[i].lerp(points[i - 1], t)
      }
    }
    // }
    // // for (let j = 0; j < pointCount / 100; j++) {
    // for (let i = 0; i < points.length; i++) {
    //   if (i === 0) {
    //     tmp.copy(mouse).sub(points[i])
    //     points[i].add(tmp)
    //   } else {
    //     let t = i / points.length
    //     t = easeInOutCubic(t)
    //     t = THREE.MathUtils.mapLinear(t, 0, 1, 0.75, 0.5)
    //     // t = 0.66
    //     for (let j = 0; j < 2; j++) {
    //       points[i].lerp(points[i - 1], t)
    //     }
    //   }
    // }
    // // }

    // update position datatexture
    for (let i = 0; i < pointCount; i++) {
      points[i].toArray(data, i * 4)
      data[i * 4 + 2] = i
      data[i * 4 + 3] = 0
    }
    positionsTexture.needsUpdate = true

    // Incorporate length to stop rendering maybe
    // let length = 0
    // for (let i = 0; i < points.length - 1; i++) {
    //   const p = points[i]
    //   const q = points[i + 1]
    //   const v = new THREE.Vector2(q.x - p.x, q.y - p.y)
    //   length += v.length()
    // }

    // // const threshold = 0.01;
    // // if (this.length >= threshold && this.static) {
    // //   this.static = false;
    // //   this.fadeStartLast = this.fadeStart;
    // //   this.fadeStart = clock.getElapsedTime();
    // // }
    // // if (this.length < threshold && !this.static) {
    // //   this.static = true;
    // //   this.fadeStartLast = this.fadeStart;
    // //   this.fadeStart = clock.getElapsedTime();
    // // }

    // if (length > 0.01) {
    //   updateGeometry()
    // }
  }

  useEffect(() => {
    // console.log('RENDER TRAIL')
    setLoaded(true)
  })

  const mouse = new THREE.Vector2()
  const mouseLast = new THREE.Vector2()

  useFrame((state, delta) => {
    // https://github.com/pmndrs/react-three-fiber/discussions/941
    mouse.set(state.mouse.x, state.mouse.y)

    if (!mousePoints && mouse.clone().sub(mouseLast).length() > 0.01) {
      for (let i = 0; i < pointCount; i++) {
        points[i].set(mouse.x, mouse.y, 0)
      }

      ref.current.material.uniforms.uDisplay.value = 1

      setMousePoints(true) // shouldn't really mutate state in useFrame but this should only be run once
    }

    sim.current.material.uniforms.uMouse.value.x = mouse.x
    sim.current.material.uniforms.uMouse.value.y = mouse.y
    sim.current.material.uniforms.uTime.value += delta

    ref.current.material.uniforms.uTime.value += delta
    // if (loaded) updatePoints(mouse, delta)
    positionsTexture.needsUpdate = true

    ref.current.material.uniforms.positions.value = target.texture
    target.texture.needsUpdate = true
    ref.current.material.needsUpdate = true

    if (!mousePoints) mouseLast.set(mouse.x, mouse.y)

    state.gl.setRenderTarget(target)
    state.gl.clear()
    state.gl.render(scene, camera)
  })
  return (
    <>
      {createPortal(
        <mesh ref={sim}>
          <planeGeometry args={[2, 2]} />
          <shaderMaterial
            vertexShader={positionsVertexShader}
            fragmentShader={positionsFragmentShader}
            uniforms={positionsUniforms}
          />
        </mesh>,
        scene
      )}

      <points ref={ref}>
        <bufferGeometry>
          {/* <bufferAttribute
            attach="index"
            count={index.length}
            itemSize={1}
            array={index}
          /> */}
          <bufferAttribute
            attach="attributes-position"
            count={position.length / 3}
            array={position}
            itemSize={3}
            // dynamic
          />
        </bufferGeometry>
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={trailUniforms}
          transparent={true}
          depthWrite={false}
          precision="lowp"
          alphaTest={0}
          // wireframe={true}
        />
      </points>
    </>
  )
})

export default TrailTest
