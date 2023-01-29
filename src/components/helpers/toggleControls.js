import { useLayoutEffect } from 'react'

export const useToggleControls = (controls) => {
  useLayoutEffect(() => {
    if (controls) {
      // Initialize as visible on config load
      const leva = document.querySelector('.leva')
      const perf = document.querySelector('.r3f-perf')
      if (leva) leva.style.visibility = 'visible'
      if (perf) perf.style.visibility = 'visible'
    }

    const handleKeyPress = (e) => {
      if (!controls || document.activeElement !== document.body) return

      if (e.key === 'd' || e.key === 'D') {
        const leva = document.querySelector('.leva')
        if (leva) {
          leva.style.visibility =
            leva.style.visibility === 'visible' ? 'hidden' : 'visible'
        }

        const perf = document.querySelector('.r3f-perf')
        if (perf) {
          perf.style.visibility =
            perf.style.visibility === 'visible' ? 'hidden' : 'visible'
        }
      }
    }

    if (controls) {
      window.addEventListener('keydown', handleKeyPress)
    }

    return () => {
      if (controls) {
        window.removeEventListener('keydown', handleKeyPress)
      }
    }
  }, [controls])
}
