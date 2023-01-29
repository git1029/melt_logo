import { useControls, folder } from 'leva'
import { useLevaHelpers } from '../../helpers/LevaControls/levaHelpers'

export const useLeva = (
  name,
  controls,
  defaults,
  config,
  updateConfig,
  dependencies
) => {
  const [mesh, trail] = dependencies

  // console.log(levaStore)

  // let schema = {}

  // if (controls) {
  const schema = {
    image: folder(
      {
        uploadLogo: {
          label: 'upload',
          image: null,
        },
      },
      { order: -4 }
    ),
    displacement: folder(
      {
        displacementStrength: {
          label: 'strength',
          value: defaults.displacementStrength,
          min: 0,
          max: 1,
          step: 0.1,
          onChange: (v) => {
            mesh.current.material.uniforms.uDisp.value.x = v
          },
        },
        displacementRadius: {
          label: 'radius',
          value: defaults.displacementRadius,
          min: 0,
          max: 1,
          step: 0.1,
          onChange: (v) => {
            trail.current.material.uniforms.uInfo.value.z = v
          },
        },
        displacementDecay: {
          label: 'decay',
          value: defaults.displacementDecay,
          min: 0,
          max: 1,
          step: 0.1,
          onChange: (v) => {
            trail.current.material.uniforms.uInfo.value.w = v
          },
        },
        colorNoise: {
          label: 'noise',
          value: defaults.colorNoise,
          min: 0,
          max: 2,
          step: 0.1,
          onChange: (v) => {
            mesh.current.material.uniforms.uDisp.value.y = v
          },
        },
        colorShift: {
          label: 'col shift',
          value: defaults.colorShift,
          min: 0,
          max: 2,
          step: 0.1,
          onChange: (v) => {
            mesh.current.material.uniforms.uDisp.value.z = v
          },
        },
      },
      { order: -3 }
    ),
    refraction: folder(
      {
        refractionRatio: {
          label: 'ratio',
          value: defaults.refractionRatio,
          min: 0,
          max: 100,
          step: 1,
        },
        mouseSpeed: {
          label: 'mouse speed',
          value: defaults.mouseSpeed,
          min: 0,
          max: 100,
          step: 1,
        },
        mouseArea: {
          label: 'mouse area',
          value: defaults.mouseArea,
          min: 0,
          max: 1,
          step: 0.1,
        },
        rotAngle: {
          label: 'rot angle',
          value: defaults.rotAngle,
          min: 0,
          max: 360,
          step: 1,
        },
        rotSpeed: {
          label: 'rot speed',
          value: defaults.rotSpeed,
          min: -10,
          max: 10,
          step: 0.5,
        },
      },
      { order: -2 }
    ),
    debug: folder(
      {
        showMouse: {
          label: 'mouse trail',
          value: false,
          onChange: (v) => {
            mesh.current.material.uniforms.uShowMouse.value = v
          },
          order: -4,
        },
        wireframe: {
          label: 'wireframe',
          value: false,
          onChange: (v) => {
            mesh.current.material.wireframe = v
          },
          order: -3,
        },
        showNormals: {
          label: 'normals',
          value: false,
          onChange: (v) => {
            mesh.current.material.uniforms.uNormal.value = v
          },
          order: -2,
        },
        showCursor: {
          label: 'cursor',
          value: true,
          onChange: (v) => {
            document.body.style.cursor = v ? 'default' : 'none'
          },
          order: -1,
        },
      },
      { order: -1 }
    ),
  }
  // }

  // console.log(schema)

  // Could limit levaControls to empty object if !controls
  // Also need to pass controls as dependency so store rebuilds input schema

  // const { image } = useControls(schema, [controls])
  const {
    uploadLogo,
    mouseArea,
    refractionRatio,
    mouseSpeed,
    rotAngle,
    rotSpeed,
  } = useControls(schema, [controls])

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

  return {
    upload: controls ? uploadLogo : null,
    mouseArea: controls ? mouseArea : config.mouseArea,
    refractionRatio: controls ? refractionRatio : config.refractionRatio,
    mouseSpeed: controls ? mouseSpeed : config.mouseSpeed,
    rotAngle: controls ? rotAngle : config.rotAngle,
    rotSpeed: controls ? rotSpeed : config.rotSpeed,
  }
}
