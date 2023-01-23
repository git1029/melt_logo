import { useState } from 'react'
import { useControls, folder } from 'leva'
import { useLevaHelpers } from '../../helpers/LevaControls/levaHelpers'

export const useLeva = (
  controls,
  config,
  updateConfig,
  server,
  dependencies
) => {
  // If animation does not use controls return local/API config
  if (!controls) {
    return config
  }

  // console.log('---useLeva config:', config)

  const [mesh, trail] = dependencies

  const [changes, setChanges] = useState(false)
  const { buttons, buttonsServer, updateStore } = useLevaHelpers(
    config,
    updateConfig,
    changes,
    (c) => setChanges(c),
    'logo'
  )

  // For live debug site could try to detect unsaved changes
  // Could compare server to current store -> but nested objects (e.g. rotSpeed, rotAngle) would always trigger difference unless do deep check or flatten config object (but then leva input would also need to be flattened)
  // Saving would send update request to config on server

  const {
    uploadLogo,
    mouseArea,
    refractionRatio,
    mouseSpeed,
    rotAngle,
    rotSpeed,
  } = useControls(
    {
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
            value: config.displacementStrength,
            min: 0,
            max: 1,
            step: 0.1,
            onChange: (v, path, { initial }) => {
              mesh.current.material.uniforms.uDisp.value.x = v
            },
          },
          displacementRadius: {
            label: 'radius',
            value: config.displacementRadius,
            min: 0,
            max: 1,
            step: 0.1,
            onChange: (v) => {
              trail.current.material.uniforms.uInfo.value.z = v
            },
          },
          displacementDecay: {
            label: 'decay',
            value: config.displacementDecay,
            min: 0,
            max: 1,
            step: 0.1,
            onChange: (v) => {
              trail.current.material.uniforms.uInfo.value.w = v
            },
          },
          colorNoise: {
            label: 'noise',
            value: config.colorNoise,
            min: 0,
            max: 2,
            step: 0.1,
            onChange: (v) => {
              mesh.current.material.uniforms.uDisp.value.y = v
            },
          },
          colorShift: {
            label: 'col shift',
            value: config.colorShift,
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
            value: config.refractionRatio,
            min: 0,
            max: 100,
            step: 1,
          },
          mouseSpeed: {
            label: 'mouse speed',
            value: config.mouseSpeed,
            min: 0,
            max: 100,
            step: 1,
          },
          mouseArea: {
            label: 'mouse area',
            value: config.mouseArea,
            min: 0,
            max: 1,
            step: 0.1,
          },
          rotAngle: {
            label: 'rot angle',
            value: config.rotAngle,
            min: 0,
            max: 360,
            step: 1,
          },
          rotSpeed: {
            label: 'rot speed',
            value: config.rotSpeed,
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
      controls: folder(server ? buttonsServer : buttons, { order: 10 }),
    },
    [changes, config]
  )

  return {
    upload: uploadLogo,
    mouseArea,
    refractionRatio,
    mouseSpeed,
    rotAngle,
    rotSpeed,
    updateStore,
  }
}
