import { Canvas } from '@react-three/fiber'
import LevaControls from '../helpers/LevaControls'
import PerfMonitor from '../helpers/PerfMonitor'
import { useToggleControls } from '../helpers/toggleControls'
import Scene from './Scene'

const glSettings = {
  antialias: false,
}

const created = ({ gl }) => {
  console.log('Canvas ready')
  gl.domElement.id = 'waterfallAnimation'
}

const WaterfallAnimation = ({ controls }) => {
  const toggleControls = useToggleControls(
    controls === undefined ? false : controls
  )

  return (
    <>
      {/* <LevaControls visible={controls && toggleControls} /> */}
      {controls ? <LevaControls visible={toggleControls} /> : null}
      <div style={{ width: '100%', height: '100vh' }}>
        <Canvas dpr={[1, 2]} gl={glSettings} onCreated={created}>
          {/* <PerfMonitor visible={controls && toggleControls} /> */}
          {controls ? <PerfMonitor visible={toggleControls} /> : null}
          <Scene controls={controls === undefined ? false : controls} />
        </Canvas>
      </div>
    </>
  )
}

export default WaterfallAnimation
