import { useState, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { Leva } from 'leva'
import { Perf } from 'r3f-perf'
import Scene from './Scene'
import './LogoAnimation.css'

const glSettings = {
  antialias: false,
}

const created = ({ gl }) => {
  console.log('Canvas ready')
  gl.domElement.id = 'logoAnimation'
}

const LogoAnimation = (props) => {
  const [sceneFps, setSceneFps] = useState(60)

  const leva = useRef()

  const controls = props.controls === undefined ? false : props.controls

  const handleControlToggle = (e) => {
    if (!controls || document.activeElement !== document.body) return

    if (e.key === 'd' || e.key === 'D') {
      // Not using Leva hidden prop + toggleControl state as causes Trail re-render
      leva.current.style.visibility =
        leva.current.style.visibility === 'visible' ? 'hidden' : 'visible'

      const r3fPerf = document.querySelector('.r3f-perf')
      r3fPerf.style.visibility =
        r3fPerf.style.visibility === 'visible' ? 'hidden' : 'visible'
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
      <div
        className="leva"
        ref={leva}
        style={{ visibility: controls ? 'visible' : 'hidden' }}
      >
        <Leva />
      </div>
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
          <Perf
            position="top-left"
            className="r3f-perf"
            style={{ visibility: controls ? 'visible' : 'hidden' }}
          />
          <PerformanceMonitor
            onChange={({ fps, factor, refreshrate, frames, averages }) => {
              // onChange is triggered when factor [0,1] changes. Factor starts at 0.5 and increases/decreased by step based on calculated performance. Once reaches 1 it won't be called again until changes.
              // Get monitored FPS to nearest 10
              // If change send that to scene/trail - NB: will cause Trail re-render
              // TODO: restrict to [30, 60, 90, 120]???
              const monitoredFps = Math.floor(fps / 10) * 10
              // console.log(
              //   `CHANGE: factor: ${factor}, actual: ${fps}, rounded: ${monitoredFps}, current: ${sceneFps}`
              // )
              if (monitoredFps !== sceneFps) {
                console.log(`--- FPS UPDATE: ${sceneFps} --> ${monitoredFps}`)
                setSceneFps(monitoredFps)
              }
            }}
            // onIncline={({ fps, factor }) => {
            //   const monitoredFps = Math.floor(fps / 10) * 10
            //   console.log(
            //     `INCLINE: factor: ${factor}, actual: ${fps}, rounded: ${monitoredFps}, current: ${sceneFps}`
            //   )
            // }}
            // onDecline={({ fps, factor }) => {
            //   const monitoredFps = Math.floor(fps / 10) * 10
            //   console.log(
            //     `DECLINE: factor: ${factor}, actual: ${fps}, rounded: ${monitoredFps}, current: ${sceneFps}`
            //   )
            // }}
          >
            <Scene fps={sceneFps} ref={props.effectRef} />
          </PerformanceMonitor>
        </Canvas>
      </div>
    </>
  )
}

export default LogoAnimation
