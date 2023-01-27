import { Canvas } from '@react-three/fiber'
import LevaControls from '../helpers/LevaControls'
import PerfMonitor from '../helpers/PerfMonitor'
import Scene from './Scene'

import { useConfig } from '../helpers/LevaControls/setupConfig'
import { useToggleControls } from '../helpers/toggleControls'

const glSettings = {
  antialias: false,
}

const created = ({ gl }) => {
  gl.domElement.id = 'waterfallAnimation'
}

const WaterfallAnimation = ({ controls }) => {
  const [config, updateConfig] = useConfig('waterfall')
  useToggleControls(controls === undefined ? false : controls)

  return (
    <>
      {controls ? <LevaControls /> : null}
      <div style={{ width: '100%', height: '100vh' }}>
        <Canvas dpr={[1, 2]} gl={glSettings} onCreated={created}>
          {controls ? <PerfMonitor /> : null}
          <Scene
            controls={controls === undefined ? false : controls}
            config={config}
            updateConfig={updateConfig}
          />
        </Canvas>
      </div>
    </>
  )
}

export default WaterfallAnimation
