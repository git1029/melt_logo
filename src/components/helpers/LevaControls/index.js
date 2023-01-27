import { forwardRef } from 'react'
import { Leva } from 'leva'
import './LevaControls.css'

const LevaControls = forwardRef((_props, ref) => {
  return (
    <div
      ref={ref}
      className="leva"
      style={{
        visibility: 'visible',
        cursor: 'default',
      }}
    >
      <Leva />
    </div>
  )
})

LevaControls.displayName = 'LevaControls'

export default LevaControls
