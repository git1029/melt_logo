import { useControls, folder } from 'leva'
import { useLevaHelpers } from '../../helpers/LevaControls/levaHelpers'
import * as THREE from 'three'

export const useLeva = (
  name,
  controls,
  defaults,
  config,
  updateConfig,
  dependencies
) => {
  const [mesh, imageOptions] = dependencies

  // console.log(levaStore)

  // let schema = {}

  // if (controls) {
  const schema = {
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
          value: defaults.imageStrength,
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
          value: defaults.lineCount,
          min: 1,
          max: 50,
          step: 1,
          onChange: (v) => {
            mesh.current.material.uniforms.uLine.value.x = v
          },
        },
        lineSpeed: {
          label: 'speed',
          value: defaults.lineSpeed,
          min: 0,
          max: 3,
          step: 0.1,
          onChange: (v) => {
            mesh.current.material.uniforms.uLine.value.y = v
          },
        },
        lineWidth: {
          label: 'width',
          value: defaults.lineWidth,
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
          value: defaults.lineColor,
          onChange: (v) => {
            mesh.current.material.uniforms.uColor.value = new THREE.Color(v)
          },
        },
        colorShift: {
          label: 'col shift',
          value: defaults.colorShift,
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
          value: defaults.mouseStrength,
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
  }
  // }

  // console.log(schema)

  // Could limit levaControls to empty object if !controls
  // Also need to pass controls as dependency so store rebuilds input schema

  const { image } = useControls(schema, [controls])
  // const { image } = useControls(schema)

  // console.log(image)

  const { buttons, changes } = useLevaHelpers(
    name,
    defaults,
    config,
    updateConfig
    // changes,
    // (c) => setChanges(c),
  )

  useControls({ controls: folder(buttons, { order: 10 }) }, [controls, changes])

  return { image: controls ? image : null }
}
