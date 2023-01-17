// import '../../css/components/LogoAnimation/LogoAnimation.css'

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
  state.gl.setPixelRatio(Math.min(window.devicePixelRatio, 2))
}

const LogoAnimation = (props) => {
  const controls = props.controls === undefined ? false : props.controls

  return (
    <>
      <Leva hidden={!controls} />
      <div style={{ width: '100%', height: '100vh', maxHeight: '1000px' }}>
        {/* <Canvas dpr={[1, 2]} gl={glSettings} onCreated={created}> */}
        <Canvas gl={glSettings} onCreated={created}>
          <PerfMonitor visible={controls} />
          <Scene />
        </Canvas>
      </div>
    </>
  )
}

export default LogoAnimation
