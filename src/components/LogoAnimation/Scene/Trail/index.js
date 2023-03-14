import * as THREE from 'three'
import { useMemo, useState, forwardRef, useEffect } from 'react'
import { createPortal, useFrame } from '@react-three/fiber'
import { useFBO } from '@react-three/drei'

import positionsVertexShader from './shaders/positionsVertex.js'
import positionsFragmentShader from './shaders/positionsFragment.js'
import vertexShader from './shaders/vertex.js'
import fragmentShader from './shaders/fragment.js'

const easeInOutCubic = (t) => {
  return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
}

const Trail = forwardRef(({ fps }, ref) => {
  const tmp = new THREE.Vector2()

  // const { size } = useThree()

  const [loaded, setLoaded] = useState(false)
  const [mousePoints, setMousePoints] = useState(false)

  const pointCount = 1000
  const limit = 512
  const targetSize = Math.min(
    limit,
    THREE.MathUtils.ceilPowerOfTwo(Math.sqrt(pointCount))
  )

  const target = useFBO(targetSize, targetSize, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat,
    type: THREE.FloatType,
    encoding: THREE.sRGBEncoding,
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
    index,
    positionsUniforms,
    trailUniforms,
    scene,
    camera,
  ] = useMemo(() => {
    const points = []
    for (let i = 0; i < pointCount; i++) {
      points.push(new THREE.Vector2(0, 0))
    }

    const data = new Float32Array(targetSize * targetSize * 4)
    const position = new Float32Array(pointCount * 3 * 2)
    const index = new Uint16Array((pointCount - 1) * 3 * 2)

    for (let i = 0; i < pointCount; i++) {
      points[i].toArray(data, i * 4)
      data[i * 4 + 2] = i // index in datatexture
      data[i * 4 + 3] = 0

      // Vertex shader will draw each vertex by order in position array
      // Want to draw point closest to mouse last so it is drawn on top (using transparency means z pos is ignored)
      // Therefore we draw position into array in reverse
      let i3 = (pointCount - i - 1) * 3 * 2
      position[i3 + 0] = position[i3 + 3] = (i % targetSize) / targetSize
      position[i3 + 1] = position[i3 + 4] = i / targetSize / targetSize
      position[i3 + 2] = -1
      position[i3 + 5] = 1

      if (i === pointCount - 1) continue
      const ind = i * 2
      index.set([ind + 0, ind + 1, ind + 2], (ind + 0) * 3)
      index.set([ind + 2, ind + 1, ind + 3], (ind + 1) * 3)
    }

    const positionsTexture = new THREE.DataTexture(
      data,
      targetSize,
      targetSize,
      THREE.RGBAFormat,
      THREE.FloatType
    )
    positionsTexture.needsUpdate = true

    const positionsUniforms = {
      positions: { value: positionsTexture },
    }

    // const { width, height } = size

    const trailUniforms = {
      positions: { value: null },
      uTime: { value: 0 },
      uSize: { value: targetSize },
      uInfo: { value: new THREE.Vector4(pointCount, 200, 1, 0.5) },
      uDisplay: { value: 0 },
      uResolution: {
        // value: new THREE.Vector2(width, height),
        value: new THREE.Vector2(),
      },
      uLength: { value: 0 },
    }

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1)

    return [
      points,
      position,
      positionsTexture,
      data,
      index,
      positionsUniforms,
      trailUniforms,
      scene,
      camera,
    ]
  }, [targetSize])

  const [fpsFactor] = useMemo(() => {
    const fpsFactor = Math.floor(
      (THREE.MathUtils.clamp(fps, 30, 120) / 60) * 100
    )
    // console.log('fpsFactor', fpsFactor)
    return [fpsFactor]
  }, [fps])

  // const getLength = () => {
  //   let length = 0
  //   for (let i = 0; i < points.length - 1; i++) {
  //     const p = points[i]
  //     const q = points[i + 1]
  //     length += tmp.set(q.x - p.x, q.y - p.y).length()
  //   }

  //   return length
  // }

  const updatePoints = (mouse) => {
    // Couldn't move position update to GPU as points need to be updated serially rather than all at same time (as need next points updated position)
    // TO DO: consistent update across diff FPS
    for (let j = 0; j < pointCount / fpsFactor; j++) {
      for (let i = points.length - 1; i >= 0; i--) {
        if (i === 0) {
          tmp.copy(mouse).sub(points[i])
          points[i].add(tmp)
        } else {
          let t = i / points.length
          t = easeInOutCubic(t)
          t = THREE.MathUtils.mapLinear(t, 0, 1, 0.5, 0.75)
          // t = 1
          points[i].lerp(points[i - 1], t)
        }
      }
    }

    // update position datatexture
    for (let i = 0; i < pointCount; i++) {
      points[i].toArray(data, i * 4)
      data[i * 4 + 2] = i
      data[i * 4 + 3] = 0
    }
    positionsTexture.needsUpdate = true

    // ref.current.material.uniforms.uLength.value = getLength()
  }

  useEffect(() => {
    // console.log('RENDER TRAIL')
    setLoaded(true)
  }, [])

  const mouse = new THREE.Vector2()
  const mouseLast = new THREE.Vector2()

  useFrame((state, delta) => {
    // https://github.com/pmndrs/react-three-fiber/discussions/941
    mouse.set(state.mouse.x, state.mouse.y)

    if (!mousePoints && mouse.clone().sub(mouseLast).length() > 0.01) {
      for (let i = 0; i < pointCount; i++) {
        points[i].set(mouse.x, mouse.y, 0)
      }

      if (ref.current && ref.current.material) {
        ref.current.material.uniforms.uDisplay.value = 1
      }

      // shouldn't really mutate state in useFrame but this should only be run once
      setMousePoints(true)
    }

    if (loaded) updatePoints(mouse, delta)

    if (ref.current && ref.current.material) {
      ref.current.material.uniforms.positions.value = target.texture
      ref.current.material.uniforms.uTime.value = delta
    }

    if (!mousePoints) mouseLast.set(mouse.x, mouse.y)

    state.gl.setRenderTarget(target)
    state.gl.clear()
    state.gl.render(scene, camera)
  })
  return (
    <>
      {createPortal(
        <mesh>
          <planeGeometry args={[2, 2]} />
          <shaderMaterial
            vertexShader={positionsVertexShader}
            fragmentShader={positionsFragmentShader}
            uniforms={positionsUniforms}
          />
        </mesh>,
        scene
      )}

      <mesh ref={ref}>
        <bufferGeometry>
          <bufferAttribute
            attach="index"
            count={index.length}
            itemSize={1}
            array={index}
          />
          <bufferAttribute
            attach="attributes-position"
            count={position.length / 3}
            array={position}
            itemSize={3}
            dynamic
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
        />
      </mesh>
    </>
  )
})

Trail.displayName = 'Trail'

export default Trail
