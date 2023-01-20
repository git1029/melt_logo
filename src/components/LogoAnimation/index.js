import { useState, useEffect, useLayoutEffect } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { Leva } from 'leva'
import { Perf } from 'r3f-perf'
import Scene from './Scene'
import './LogoAnimation.css'

const PerfMonitor = ({ visible }) => {
  return (
    <Perf
      position="top-left"
      className="r3f-perf"
      style={{ visibility: visible ? 'visible' : 'hidden' }}
    />
  )
}

function FrameLimiter({ limit = 60 }) {
  const { invalidate, clock, advance } = useThree()
  useEffect(() => {
    let delta = 0
    const interval = 1 / limit
    const update = () => {
      requestAnimationFrame(update)
      delta += clock.getDelta()

      if (delta > interval) {
        invalidate()
        delta = delta % interval
      }
    }

    update()
  }, [])

  return null
}

function FPSLimiter({ fps }) {
  const set = useThree((state) => state.set)
  const get = useThree((state) => state.get)
  const advance = useThree((state) => state.advance)
  const frameloop = useThree((state) => state.frameloop)

  useLayoutEffect(() => {
    const initFrameloop = get().frameloop

    return () => {
      set({ frameloop: initFrameloop })
    }
  }, [])

  useFrame((state) => {
    if (state.get().blocked) return
    state.set({ blocked: true })

    setTimeout(() => {
      state.set({ blocked: false })

      state.advance()
    }, Math.max(0, 1000 / fps - state.clock.getDelta()))
  })

  useEffect(() => {
    if (frameloop !== 'never') {
      set({ frameloop: 'never' })
      advance()
    }
  }, [frameloop])

  return null
}

const glSettings = {
  antialias: false,
}

const created = ({ gl }) => {
  console.log('Canvas ready')
  gl.domElement.id = 'logoAnimation'
}

const LogoAnimation = (props) => {
  const [toggleControls, setToggleControls] = useState(true)

  const controls = props.controls === undefined ? false : props.controls

  const handleControlToggle = (e) => {
    if (e.key === 'd') {
      if (document.activeElement !== document.body || !controls) return
      setToggleControls(!toggleControls)
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleControlToggle)

    return () => {
      window.removeEventListener('keydown', handleControlToggle)
    }
  })

  return (
    <>
      <Leva hidden={!controls || !toggleControls} />
      <div
        style={{
          width: '100%',
          height: '100vh',
          maxHeight: '1000px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Canvas
          dpr={[1, 2]}
          gl={glSettings}
          onCreated={created}
          // frameloop="demand"
        >
          {/* <FrameLimiter limit={60} /> */}
          {/* <FPSLimiter fps={30} /> */}
          <PerfMonitor visible={controls && toggleControls} />
          <Scene ref={props.effectRef} />
        </Canvas>
      </div>
    </>
  )
}

export default LogoAnimation
