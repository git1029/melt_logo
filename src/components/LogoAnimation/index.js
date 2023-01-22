import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import LevaControls from '../helpers/LevaControls'
import PerfMonitor from '../helpers/PerfMonitor'
import { useToggleControls } from '../helpers/toggleControls'
import Scene from './Scene'

const glSettings = {
  antialias: false,
}

const created = ({ gl }) => {
  console.log('Canvas ready')
  gl.domElement.id = 'logoAnimation'
}

const LogoAnimation = ({ controls, effectRef }) => {
  const [sceneFps, setSceneFps] = useState(60)

  const toggleControls = useToggleControls(
    controls === undefined ? false : controls
  )

  return (
    <>
      {/* <LevaControls visible={controls && toggleControls} /> */}
      {controls ? <LevaControls visible={toggleControls} /> : null}
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
        <Canvas dpr={[1, 2]} gl={glSettings} onCreated={created}>
          {/* <PerfMonitor visible={controls && toggleControls} /> */}
          {controls ? <PerfMonitor visible={toggleControls} /> : null}

          <PerformanceMonitor
            onChange={({ fps, factor, refreshrate, frames, averages }) => {
              // onChange is triggered when factor [0,1] changes. Factor starts at 0.5 and increases/decreased by step based on calculated performance. Once reaches 1 it won't be called again until changes.
              // Get monitored FPS to nearest 10
              // If change send that to scene/trail - NB: will cause Trail re-render
              // TODO: restrict to [30, 60, 90, 120]???
              const monitoredFps = Math.floor(fps / 10) * 10
              if (monitoredFps !== sceneFps) {
                console.log(`--- FPS UPDATE: ${sceneFps} --> ${monitoredFps}`)
                setSceneFps(monitoredFps)
              }
            }}
          >
            <Scene
              fps={sceneFps}
              controls={controls === undefined ? false : true}
              ref={effectRef}
            />
          </PerformanceMonitor>
        </Canvas>
      </div>
    </>
  )
}

export default LogoAnimation
