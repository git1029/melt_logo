import { useRef } from 'react'

export const useFadeEffect = () => {
  const effectRef = useRef()

  const updateFadeEffect = (stage) => {
    if (stage !== 0 && stage !== 1) return

    if (effectRef.current) {
      if (effectRef.current.uniforms.uTransition.value.x !== stage) {
        const { uTransition, uTime, uFadeLast } = effectRef.current.uniforms
        uFadeLast.value = uTransition.value.y
        uTransition.value.x = stage
        uTransition.value.w = uTransition.value.z
        uTransition.value.z = uTime.value
      }
    }
  }

  return {
    effectRef,
    updateFadeEffect,
  }
}
