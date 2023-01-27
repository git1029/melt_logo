import { useLayoutEffect } from 'react'

export const useToggleControls = (controls) => {
  useLayoutEffect(() => {
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
