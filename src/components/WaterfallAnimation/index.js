import { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Leva } from 'leva'
import { Perf } from 'r3f-perf'
import Scene from './Scene'
import './WaterfallAnimation.css'

const PerfMonitor = ({ visible }) => {
  return (
    <Perf
      position="top-left"
      className="r3f-perf"
      style={{ visibility: visible ? 'visible' : 'hidden' }}
    />
  )
}

const glSettings = {
  antialias: false,
}

const created = ({ gl }) => {
  console.log('Canvas ready')
  gl.domElement.id = 'waterfallAnimation'
}

const WaterfallAnimation = (props) => {
  const [toggleControls, setToggleControls] = useState(true)

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
      <div style={{ width: '100%', height: '100vh' }}>
        <Canvas dpr={[1, 2]} gl={glSettings} onCreated={created}>
          <PerfMonitor visible={controls && toggleControls} />
          <Scene />
        </Canvas>
      </div>
    </>
  )
}

export default WaterfallAnimation
