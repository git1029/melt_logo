import { forwardRef } from 'react'
import { Leva } from 'leva'
import './Leva.css'

const LevaControls = forwardRef(({ controls }, ref) => {
  return (
    <div
      ref={ref}
      className="leva"
      style={{
        visibility: 'visible',
        cursor: 'default',
      }}
    >
      <Leva hidden={!controls} />
    </div>
  )
})

LevaControls.displayName = 'LevaControls'

export default LevaControls
