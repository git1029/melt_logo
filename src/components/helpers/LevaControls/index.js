import { Leva } from 'leva'

const LevaControls = ({ visible }) => {
  return (
    <div
      className="leva"
      style={{
        visibility: visible ? 'visible' : 'hidden',
        cursor: 'default',
      }}
    >
      <Leva />
    </div>
  )
}

export default LevaControls
