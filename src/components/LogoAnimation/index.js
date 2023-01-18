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

const created = ({ gl, size, viewport, camera }) => {
  console.log('Canvas ready')
  gl.domElement.id = 'logoAnimation'
  // state.gl.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  // console.log(viewport)
  // // gl.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  // gl.setSize(size.width, size.height)
  // gl.setViewport(0, 0, size.width * viewport.dpr, size.height * viewport.dpr)
  // console.log(viewport)

  // state.gl.setPixelRatio(2)
  // state.gl.setPixelRatio(1)
}

const LogoAnimation = (props) => {
  const controls = props.controls === undefined ? false : props.controls
  // console.log(controls)

  return (
    <>
      <Leva hidden={!controls} />
      {/* <div style={{ width: '100%', height: '100vh', maxHeight: '1000px' }}> */}
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
          {/* <Canvas gl={glSettings} onCreated={created}> */}
          <PerfMonitor visible={controls} />
          <Scene ref={props.effectRef} />
        </Canvas>
      </div>
    </>
  )
}

export default LogoAnimation
