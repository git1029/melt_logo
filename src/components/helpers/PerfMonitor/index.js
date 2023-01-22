import { Perf } from 'r3f-perf'

const PerfMonitor = ({ visible }) => {
  return (
    <Perf
      position="top-left"
      className="r3f-perf"
      style={{
        visibility: visible ? 'visible' : 'hidden',
        pointerEvents: 'none',
      }}
    />
  )
}

export default PerfMonitor
