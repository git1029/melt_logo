import { useState, useEffect } from 'react'

export const useToggleControls = (controls) => {
  const [toggleControls, setToggleControls] = useState(true)

  // NB: listeners are removed/added on every d/D keypress else handler loses scope and connection to state is lost
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!controls || document.activeElement !== document.body) return

      if (e.key === 'd' || e.key === 'D') {
        setToggleControls(!toggleControls)
      }
    }

    window.addEventListener('keydown', handleKeyPress)

    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  })

  return toggleControls
}
