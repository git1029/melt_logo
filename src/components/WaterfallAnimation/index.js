import { Canvas } from '@react-three/fiber'
import LevaControls from '../helpers/LevaControls'
import PerfMonitor from '../helpers/PerfMonitor'
import Scene from './Scene'

import { useConfig } from '../helpers/LevaControls/setupConfig'
import { useToggleControls } from '../helpers/toggleControls'
import { getLocalStorageConfig } from '../helpers/LevaControls/setupConfig'
// import { getLocalStorageConfig } from '../../helpers/LevaControls/setupConfig'
// import { useEffect } from 'react'

const glSettings = {
  antialias: false,
}

const created = ({ gl }) => {
  gl.domElement.id = 'waterfallAnimation'
}

const name = 'waterfall'

const WaterfallAnimation = ({ controls }) => {
  const [config, updateConfig] = useConfig(name)
  const localStorageConfig = getLocalStorageConfig(name)
  useToggleControls(controls === undefined ? false : controls)

  return (
    <>
      <LevaControls controls={controls === undefined ? false : controls} />
      <div style={{ width: '100%', height: '100vh' }}>
        <Canvas dpr={[1, 2]} gl={glSettings} onCreated={created}>
          {controls ? <PerfMonitor /> : null}
          <Scene
            name={name}
            controls={controls === undefined ? false : controls}
            config={config}
            updateConfig={updateConfig}
            localStorageConfig={localStorageConfig}
          />
        </Canvas>
      </div>
    </>
  )
}

export default WaterfallAnimation
