import { useState, useRef, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import LevaControls from '../helpers/LevaControls'
import PerfMonitor from '../helpers/PerfMonitor'
import Scene from './Scene'

import { useConfig } from '../helpers/LevaControls/setupConfig'
import { useToggleControls } from '../helpers/toggleControls'
import { getLocalStorageConfig } from '../helpers/LevaControls/setupConfig'

const glSettings = {
  antialias: false,
}

const created = ({ gl }) => {
  gl.domElement.id = 'logoAnimation'
}

// const name = 'logo'

const LogoAnimation = ({ controls, effectRef, mobile }) => {
  const [name, setName] = useState(
    (mobile && controls) || window.innerHeight < 1000 ? 'logo-mobile' : 'logo'
  )
  const updateName = (newName) => {
    // console.log('setting name', newName)
    setName(newName)
  }

  useEffect(() => {
    if (controls) {
      document.body.classList.add('controls')
    } else {
      document.body.classList.remove('controls')
    }

    // if (mobile && controls) {
    //   setName('logo-mobile')
    // }
  }, [controls])

  const [sceneFps, setSceneFps] = useState(60)

  const [config, updateConfig] = useConfig(name)
  const localStorageConfig = getLocalStorageConfig(name)
  useToggleControls(controls === undefined ? false : controls)

  // console.log(config)

  const container = useRef()

  return (
    <>
      <LevaControls controls={controls === undefined ? false : controls} />
      <div
        ref={container}
        style={{
          // width: '100%',
          // height: '100vh',
          width: mobile && controls ? '390px' : '100%',
          height: mobile && controls ? '844px' : '100vh',
          // padding: mobile && controls ? '20px' : '0',
          maxHeight: controls ? '100vh' : '1000px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1,
        }}
      >
        <Canvas dpr={[1, 2]} gl={glSettings} onCreated={created}>
          {controls ? <PerfMonitor /> : null}

          <PerformanceMonitor
            onChange={({ fps }) => {
              // { fps, factor, refreshrate, frames, averages }
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
              name={name}
              controls={controls === undefined ? false : controls}
              config={config}
              updateConfig={updateConfig}
              localStorageConfig={localStorageConfig}
              ref={effectRef}
              containerRef={container}
              updateName={updateName}
            />
          </PerformanceMonitor>
        </Canvas>
      </div>
    </>
  )
}

export default LogoAnimation
