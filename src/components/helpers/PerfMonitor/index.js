import { Perf } from 'r3f-perf'

const PerfMonitor = () => {
  return (
    <Perf
      position="top-left"
      className="r3f-perf"
      style={{
        visibility: 'visible',
        pointerEvents: 'none',
      }}
    />
  )
}

export default PerfMonitor
