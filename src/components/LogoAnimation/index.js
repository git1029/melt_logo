import { useState, useEffect, useLayoutEffect } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
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

// function FrameLimiter({ limit = 60 }) {
//   const { invalidate, clock, advance } = useThree()
//   useEffect(() => {
//     let delta = 0
//     const interval = 1 / limit
//     const update = () => {
//       requestAnimationFrame(update)
//       delta += clock.getDelta()

//       if (delta > interval) {
//         invalidate()
//         delta = delta % interval
//       }
//     }

//     update()
//   }, [])

//   return null
// }

// function FPSLimiter({ fps }) {
//   const set = useThree((state) => state.set)
//   const get = useThree((state) => state.get)
//   const advance = useThree((state) => state.advance)
//   const frameloop = useThree((state) => state.frameloop)

//   useLayoutEffect(() => {
//     const initFrameloop = get().frameloop

//     return () => {
//       set({ frameloop: initFrameloop })
//     }
//   }, [])

//   useFrame((state) => {
//     if (state.get().blocked) return
//     state.set({ blocked: true })

//     setTimeout(() => {
//       state.set({ blocked: false })

//       state.advance()
//     }, Math.max(0, 1000 / fps - state.clock.getDelta()))
//   })

//   useEffect(() => {
//     if (frameloop !== 'never') {
//       set({ frameloop: 'never' })
//       advance()
//     }
//   }, [frameloop])

//   return null
// }

const glSettings = {
  antialias: false,
}

const created = ({ gl }) => {
  console.log('Canvas ready')
  gl.domElement.id = 'logoAnimation'
}

const LogoAnimation = (props) => {
  const [toggleControls, setToggleControls] = useState(true)
  const [sceneFps, setSceneFps] = useState(60)

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
          <PerfMonitor visible={controls && toggleControls} />
          <PerformanceMonitor
            onChange={({ fps, factor, refreshrate, frames, averages }) => {
              // console.log(
              //   'fps\n',
              //   fps,
              //   '\nfactor\n',
              //   factor,
              //   '\nrefreshrate\n',
              //   refreshrate,
              //   '\nframes\n',
              //   frames,
              //   '\naverages\n',
              //   averages
              // )
              // onChange is triggered when factor [0,1] changes. Factor starts at 0.5 and increases/decreased by step based on calculated performance. Once reaches 1 it won't be called again until changes.
              // Get monitored FPS to nearest 10
              // If change send that to scene/trail - NB: will cause Trail re-render
              // TODO: restrict to [30, 60, 90, 120]???
              const monitoredFps = Math.floor(fps / 10) * 10
              console.log(
                `CHANGE: factor: ${factor}, actual: ${fps}, rounded: ${monitoredFps}, current: ${sceneFps}`
              )
              if (monitoredFps !== sceneFps) {
                console.log(`--- FPS UPDATE: ${sceneFps} --> ${monitoredFps}`)
                setFps(monitoredFps)
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
            {/* <FrameLimiter limit={30} /> */}
            {/* <FPSLimiter fps={60} /> */}
            <Scene fps={sceneFps} ref={props.effectRef} />
          </PerformanceMonitor>
        </Canvas>
      </div>
    </>
  )
}

export default LogoAnimation
