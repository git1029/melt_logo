import * as THREE from 'three'
import { useRef, useMemo, useEffect, useState, forwardRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import vertexShader from './shaders/vertex.js'
import fragmentShader from './shaders/fragment.js'
import * as MathUtils from 'three/src/math/MathUtils.js'
import { easeInOutCubic } from '../utils.js'

// https://tympanus.net/codrops/2019/09/24/crafting-stylised-mouse-trails-with-ogl/
// https://stackoverflow.com/questions/50077508/three-js-indexed-buffergeometry-vs-instancedbuffergeometry

const Trail = forwardRef(({ radius, decay }, ref) => {
  const geometry = useRef()
  const pointCount = 1000 / 1

  const tmp = new THREE.Vector3()

  const { viewport } = useThree()

  const [loaded, setLoaded] = useState(false)
  const [mousePoints, setMousePoints] = useState(false)

  const [points, position, next, prev, info, index, uniforms] = useMemo(() => {
    const points = []
    const position = new Float32Array(pointCount * 3 * 2) // 2 vertices per point
    const next = new Float32Array(pointCount * 3 * 2)
    const prev = new Float32Array(pointCount * 3 * 2)
    const index = new Uint16Array((pointCount - 1) * 3 * 2)
    const info = new Float32Array(pointCount * 4 * 2)

    for (let i = 0; i < pointCount; i++) {
      const v = i / (pointCount - 1)
      info.set([0, v], i * 4 * 2)
      info.set([1, v], i * 4 * 2 + 4)

      info.set([-1], i * 4 * 2 + 2)
      info.set([1], i * 4 * 2 + 2 + 4)

      info.set([i], i * 4 * 2 + 3)
      info.set([i], i * 4 * 2 + 3 + 4)

      if (i === pointCount - 1) continue
      const ind = i * 2
      index.set([ind + 0, ind + 1, ind + 2], (ind + 0) * 3)
      index.set([ind + 2, ind + 1, ind + 3], (ind + 1) * 3)
    }

    for (let i = 0; i < pointCount; i++) {
      points.push(new THREE.Vector3(0, 0, 0))
    }

    points.forEach((p, i) => {
      p.toArray(position, i * 3 * 2)
      p.toArray(position, i * 3 * 2 + 3)
      p.toArray(next, i * 3 * 2)
      p.toArray(next, i * 3 * 2 + 3)
      p.toArray(prev, i * 3 * 2)
      p.toArray(prev, i * 3 * 2 + 3)
    })

    const uniforms = {
      uInfo: { value: new THREE.Vector4(pointCount, 200, radius, decay) },
      resolution: { value: new THREE.Vector2(viewport.width, viewport.height) },
      uTime: { value: 0 },
      uDisplay: { value: 0 },
    }

    return [points, position, next, prev, info, index, uniforms]
  }, [])

  const mouse = new THREE.Vector3()
  const mouseLast = new THREE.Vector3()

  useFrame((state, delta) => {
    // https://github.com/pmndrs/react-three-fiber/discussions/941
    mouse.set(state.mouse.x, state.mouse.y, 0)

    if (!mousePoints && mouse.clone().sub(mouseLast).length() > 0.01) {
      for (let i = 0; i < pointCount; i++) {
        points[i].set(state.mouse.x, state.mouse.y, 0)
      }
      points.forEach((p, i) => {
        p.toArray(position, i * 3 * 2)
        p.toArray(position, i * 3 * 2 + 3)
        p.toArray(next, i * 3 * 2)
        p.toArray(next, i * 3 * 2 + 3)
        p.toArray(prev, i * 3 * 2)
        p.toArray(prev, i * 3 * 2 + 3)
      })

      geometry.current.attributes.position.needsUpdate = true
      geometry.current.attributes.prev.needsUpdate = true
      geometry.current.attributes.next.needsUpdate = true

      ref.current.material.uniforms.uDisplay.value = 1

      setMousePoints(true)
    }

    if (loaded) updatePoints(mouse)

    if (!mousePoints) mouseLast.set(mouse.x, mouse.y, 0)

    // console.log('is rendering')
  })

  const updatePoints = (mouse) => {
    for (let j = 0; j < points.length / 100; j++) {
      for (let i = points.length - 1; i >= 0; i--) {
        if (!i) {
          tmp.copy(mouse).sub(points[i])
          points[i].add(tmp)
        } else {
          let t = i / points.length
          t = easeInOutCubic(t)
          t = MathUtils.mapLinear(t, 0, 1, 0.5, 0.75)
          // t = 0.75;
          points[i].lerp(points[i - 1], t)
        }
      }
    }

    let length = 0
    for (let i = 0; i < points.length - 1; i++) {
      const p = points[i]
      const q = points[i + 1]
      const v = new THREE.Vector2(q.x - p.x, q.y - p.y)
      length += v.length()
    }

    // const threshold = 0.01;
    // if (this.length >= threshold && this.static) {
    //   this.static = false;
    //   this.fadeStartLast = this.fadeStart;
    //   this.fadeStart = clock.getElapsedTime();
    // }
    // if (this.length < threshold && !this.static) {
    //   this.static = true;
    //   this.fadeStartLast = this.fadeStart;
    //   this.fadeStart = clock.getElapsedTime();
    // }

    if (length > 0.01) {
      updateGeometry()
    }
  }

  const updateGeometry = () => {
    for (let i = 0; i < points.length; i++) {
      let p = points[points.length - i - 1]

      p.toArray(position, i * 3 * 2)
      p.toArray(position, i * 3 * 2 + 3)

      if (!i) {
        // If first point, calculate prev using the distance to 2nd point
        tmp
          .copy(p)
          .sub(points[i + 1])
          .add(p)
        tmp.toArray(next, i * 3 * 2)
        tmp.toArray(next, i * 3 * 2 + 3)
      } else {
        p.toArray(prev, (i - 1) * 3 * 2)
        p.toArray(prev, (i - 1) * 3 * 2 + 3)
      }

      if (i === points.length - 1) {
        // If last point, calculate next using distance to 2nd last point
        tmp
          .copy(p)
          .sub(points[i - 1])
          .add(p)
        tmp.toArray(prev, i * 3 * 2)
        tmp.toArray(prev, i * 3 * 2 + 3)
      } else {
        p.toArray(next, (i + 1) * 3 * 2)
        p.toArray(next, (i + 1) * 3 * 2 + 3)
      }
    }

    geometry.current.attributes.position.needsUpdate = true
    geometry.current.attributes.prev.needsUpdate = true
    geometry.current.attributes.next.needsUpdate = true
  }

  useEffect(() => {
    setLoaded(true)

    // document.querySelector('.loader').classList.remove('show')
  }, [])

  return (
    <>
      <mesh ref={ref}>
        <bufferGeometry ref={geometry}>
          <bufferAttribute
            attach="index"
            count={index.length}
            itemSize={1}
            array={index}
          />
          <bufferAttribute
            attach="attributes-position"
            count={position.length / 3}
            itemSize={3}
            array={position}
            dynamic
          />
          <bufferAttribute
            attach="attributes-next"
            count={next.length / 3}
            itemSize={3}
            array={next}
            dynamic
          />
          <bufferAttribute
            attach="attributes-prev"
            count={prev.length / 3}
            itemSize={3}
            array={prev}
            dynamic
          />
          <bufferAttribute
            attach="attributes-info"
            count={info.length / 4}
            itemSize={4}
            array={info}
          />
        </bufferGeometry>
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent={true}
          depthWrite={false}
          precision="lowp"
          alphaTest={0}
        />
      </mesh>
    </>
  )
})

export default Trail
