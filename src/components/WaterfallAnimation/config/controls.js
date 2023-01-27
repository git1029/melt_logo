import { useState } from 'react'
import { Color } from 'three'
import { useControls, folder } from 'leva'
import { useLevaHelpers } from '../../helpers/LevaControls/levaHelpers'

export const useLeva = (controls, config, updateConfig, dependencies) => {
  const [mesh, imageOptions] = dependencies

  const [changes, setChanges] = useState(false)
  const { buttons, updateStore } = useLevaHelpers(
    config,
    updateConfig,
    changes,
    (c) => setChanges(c),
    'waterfall'
  )

  // // NB: Leva store is maintained until refresh even if component with Leva component is unmounted (i.e. on tab change between logo/waterfall animations). Inputs with same paths e.g. image.upload are shared, therefore uploaded image persists between tab change.
  // // blurStrength will only update in waterfall component state onEditEnd, onMount value will default to 2, instead check if cached value in Leva store and use that
  // useEffect(() => {
  //   if (store.data['image.blurStrength'] !== undefined)
  //     updateBlurStrength(store.data['image.blurStrength'].value)
  // }, [])

  // const { image, uploadWaterfall } = useControls(
  const { image } = useControls(
    {
      image: folder(
        {
          image: {
            options: imageOptions,
            order: -4,
          },
          // uploadWaterfall: {
          //   label: 'upload',
          //   image: null,
          //   order: -3,
          // },
          // blurStrength: {
          //   label: 'blur',
          //   value: 2,
          //   min: 0,
          //   max: 20,
          //   step: 1,
          //   order: -2,
          //   onEditEnd: (v) => {
          //     updateBlurStrength(v)
          //   },
          // },
          imageStrength: {
            label: 'strength',
            value: config.imageStrength,
            min: 0,
            max: 1,
            step: 0.01,
            onChange: (v) => {
              mesh.current.material.uniforms.uDistortion.value.x = v
            },
            order: -1,
          },
        },
        { order: -4 }
      ),
      lines: folder(
        {
          lineCount: {
            label: 'count',
            value: config.lineCount,
            min: 1,
            max: 50,
            step: 1,
            onChange: (v) => {
              mesh.current.material.uniforms.uLine.value.x = v
            },
          },
          lineSpeed: {
            label: 'speed',
            value: config.lineSpeed,
            min: 0,
            max: 3,
            step: 0.1,
            onChange: (v) => {
              mesh.current.material.uniforms.uLine.value.y = v
            },
          },
          lineWidth: {
            label: 'width',
            value: config.lineWidth,
            min: 0,
            max: 1,
            step: 0.01,
            onChange: (v) => {
              mesh.current.material.uniforms.uLine.value.z = v
            },
          },
          lineDistortion: {
            label: 'distortion',
            value: config.lineDistortion,
            min: 0,
            max: 1,
            step: 0.01,
            onChange: (v) => {
              mesh.current.material.uniforms.uDistortion.value.y = v
            },
          },
          lineColor: {
            label: 'color',
            value: config.lineColor,
            onChange: (v) => {
              mesh.current.material.uniforms.uColor.value = new Color(v)
            },
          },
          colorShift: {
            label: 'col shift',
            value: config.colorShift,
            min: 0,
            max: 1,
            step: 0.01,
            onChange: (v) => {
              mesh.current.material.uniforms.uLine.value.w = v
            },
          },
        },
        { order: -3 }
      ),
      mouse: folder(
        {
          // mouseEnabled: {
          //   label: 'enabled',
          //   value: config.mouseEnabled,
          //   onChange: (v) => {
          //     mesh.current.material.uniforms.uDistortion.value.z = v
          //     // updateLocalStorage()
          //   },
          // },
          mouseStrength: {
            label: 'strength',
            value: config.mouseStrength,
            min: 0,
            max: 1,
            step: 0.01,
            onChange: (v) => {
              mesh.current.material.uniforms.uDistortion.value.w = v
            },
          },
        },
        { order: -2 }
      ),
      debug: folder(
        {
          showCursor: {
            label: 'cursor',
            value: true,
            onChange: (v) => {
              document.body.style.cursor = v ? 'default' : 'none'
            },
          },
        },
        { order: -1 }
      ),
      controls: folder(buttons, { order: 10 }),
    },
    [changes, config]
  )

  // return { image, upload: uploadWaterfall, updateStore }
  return { image: controls ? image : null, updateStore }
}
