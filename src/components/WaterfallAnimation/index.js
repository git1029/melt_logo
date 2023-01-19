import { Canvas } from '@react-three/fiber'
import { Leva } from 'leva'
import { Perf } from 'r3f-perf'
import Scene from './Scene'

const PerfMonitor = ({ visible }) => {
  if (!visible) {
    return null
  }

  return <Perf position="top-left" />
}

const glSettings = {
  antialias: false,
}

const created = (state) => {
  console.log('Canvas ready')
  state.gl.domElement.id = 'logoAnimation'
}

const WaterfallAnimation = (props) => {
  const controls = props.controls ? true : false

  return (
    <>
      <Leva hidden={!controls} />
      <div style={{ width: '100%', height: '100vh' }}>
        <Canvas dpr={[1, 2]} gl={glSettings} onCreated={created}>
          <PerfMonitor visible={controls} />
          <Scene />
        </Canvas>
      </div>
    </>
  )
}

export default WaterfallAnimation
