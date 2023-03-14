// import { useEffect } from 'react'
import * as THREE from 'three'
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
  const [mesh, imageOptions, updateBlurStrength] = dependencies

  const schema = {
    image: folder(
      {
        image: {
          options: imageOptions,
          order: -4,
        },
        uploadWaterfall: {
          label: 'upload',
          image: null,
          order: -3,
        },
        blurStrength: {
          label: 'blur',
          value: 2,
          min: 0,
          max: 20,
          step: 1,
          order: -2,
          onEditEnd: (v) => {
            updateBlurStrength(v)
          },
          // Only render blur slider if upload !== null
          render: (get) => get('image.uploadWaterfall'),
        },
        // downloadImage: '',
        imageScale: {
          label: 'scale',
          value: 1,
          min: 0.1,
          max: 2,
          step: 0.01,
          onChange: (v) => {
            if (mesh.current && mesh.current.material) {
              mesh.current.material.uniforms.uImageScale.value = v
            }
          },
        },
        imageStrength: {
          label: 'strength',
          value: defaults.imageStrength,
          min: 0,
          max: 1,
          step: 0.01,
          onChange: (v) => {
            if (mesh.current && mesh.current.material) {
              mesh.current.material.uniforms.uDistortion.value.x = v
            }
          },
          order: 0,
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
            if (mesh.current && mesh.current.material) {
              mesh.current.material.uniforms.uLine.value.x = v
            }
          },
        },
        lineSpeed: {
          label: 'speed',
          value: defaults.lineSpeed,
          min: 0,
          max: 3,
          step: 0.1,
          onChange: (v) => {
            if (mesh.current && mesh.current.material) {
              mesh.current.material.uniforms.uLine.value.y = v
            }
          },
        },
        lineWidth: {
          label: 'width',
          value: defaults.lineWidth,
          min: 0,
          max: 1,
          step: 0.01,
          onChange: (v) => {
            if (mesh.current && mesh.current.material) {
              mesh.current.material.uniforms.uLine.value.z = v
            }
          },
        },
        lineDistortion: {
          label: 'distortion',
          value: defaults.lineDistortion,
          min: 0,
          max: 1,
          step: 0.01,
          onChange: (v) => {
            if (mesh.current && mesh.current.material) {
              mesh.current.material.uniforms.uDistortion.value.y = v
            }
          },
        },
        lineColor: {
          label: 'color',
          value: defaults.lineColor,
          onChange: (v) => {
            if (mesh.current && mesh.current.material) {
              mesh.current.material.uniforms.uColor.value = new THREE.Color(v)
            }
          },
        },
        colorShift: {
          label: 'col shift',
          value: defaults.colorShift,
          min: 0,
          max: 1,
          step: 0.01,
          onChange: (v) => {
            if (mesh.current && mesh.current.material) {
              mesh.current.material.uniforms.uLine.value.w = v
            }
          },
        },
      },
      { order: -3 }
    ),
    mouse: folder(
      {
        mouseStrength: {
          label: 'strength',
          value: defaults.mouseStrength,
          min: 0,
          max: 1,
          step: 0.01,
          onChange: (v) => {
            if (mesh.current && mesh.current.material) {
              mesh.current.material.uniforms.uDistortion.value.w = v
            }
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

  // Could limit levaControls to empty object if !controls
  // Also need to pass controls as dependency so store rebuilds input schema

  const { image, uploadWaterfall } = useControls(schema, [controls])

  const { buttons, changes } = useLevaHelpers(
    name,
    defaults,
    config,
    updateConfig
  )

  useControls({ controls: folder(buttons, { order: 10 }) }, [
    controls,
    changes,
    config,
  ])

  // // Add download image button template
  // const downloadImage = document.getElementById('image.downloadImage')
  // useEffect(() => {
  //   if (downloadImage === null) return

  //   const div = document.createElement('div')
  //   div.setAttribute('id', 'download-image')
  //   div.classList.add('leva-c-grzFYX')
  //   const btn = document.createElement('button')
  //   btn.setAttribute('id', 'download-image-button')
  //   btn.classList.add('leva-c-ihqPFh')
  //   btn.innerHTML = 'download image'
  //   div.appendChild(btn)
  //   if (
  //     downloadImage.parentNode &&
  //     downloadImage.parentNode.parentNode &&
  //     downloadImage.parentNode.parentNode.parentNode
  //   ) {
  //     downloadImage.parentNode.parentNode.parentNode.insertAdjacentElement(
  //       'afterend',
  //       div
  //     )
  //     downloadImage.parentNode.parentNode.parentNode.style.display = 'none'
  //   }
  // }, [downloadImage])

  return {
    upload: controls ? uploadWaterfall : null,
    image: controls ? image : null,
  }
}
