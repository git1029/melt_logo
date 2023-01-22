import { useState, useEffect } from 'react'
// import { useLocation } from 'react-router-dom'
import { button, levaStore } from 'leva'
import { downloadConfig } from './downloadConfig'
import configService from '../../../services/configService'

export const useLevaHelpers = (
  config,
  updateConfig,
  changes,
  setChanges,
  name
) => {
  const store = levaStore.useStore()

  const [init, setInit] = useState(null)

  const updateLocalStorage = () => {
    let localConfig = JSON.parse(window.localStorage.getItem('melt_config'))
    if (localConfig === null) localConfig = {}
    if (localConfig[name] === undefined) localConfig[name] = {}
    const values = getStore()
    // console.log('values', values)
    localConfig[name] = values
    // console.log('----levaHelpers [store] updating localStorage', localConfig)
    window.localStorage.setItem('melt_config', JSON.stringify(localConfig))
  }

  useEffect(() => {
    if (init === null) return

    const data = store.data
    const paths = Object.keys(data)
    paths.forEach((path) => {
      const p = path.split('.').pop()
      if (init[p] !== undefined) {
        levaStore.setValueAtPath(path, init[p])
        levaStore.subscribeToEditEnd(path, updateLocalStorage)
      }
    })
  }, [init])

  useEffect(() => {
    const data = store.data
    const paths = Object.keys(data)

    let hasChanged = false
    paths.forEach((path) => {
      const p = path.split('.').pop()
      if (config[p] !== undefined) {
        if (typeof config[p] === 'object') {
          // Check object values (NB: this only caters for 1 level deep)
          const nestedKeys = Object.keys(config[p])
          nestedKeys.forEach((key) => {
            if (
              config[p][key] !== undefined &&
              data[path].value[key] !== undefined
            ) {
              if (config[p][key] !== data[path].value[key]) {
                hasChanged = true
              }
            }
          })
        } else {
          if (config[p] !== data[path].value) {
            hasChanged = true
          }
        }
      }
    })

    if (hasChanged !== changes) {
      setChanges(hasChanged)
    }
  }, [store, config])

  const saveConfig = async () => {
    const values = getStore()
    const newConfig = {
      fields: {
        config: JSON.stringify(values),
      },
    }

    // TODO: Add try/catch
    const savedConfig = await configService.updateConfig(values.id, newConfig)
    console.log('saved', savedConfig)

    updateConfig(values)
  }

  const resetStore = () => {
    const data = store.data
    const paths = Object.keys(data)

    paths.forEach((path) => {
      const p = path.split('.').pop()
      if (config[p] !== undefined) {
        // Reset to last saved config (server)
        levaStore.setValueAtPath(path, config[p])
      }
    })

    updateLocalStorage()
  }

  const updateStore = (values) => {
    setInit(values)
  }

  const getStore = () => {
    const data = store.data
    const keys = Object.keys(data)
    const newConfig = { ...config }

    keys.forEach((key) => {
      const k = key.split('.').pop()
      if (newConfig[k] !== undefined) {
        newConfig[k] = data[key].value
      }
    })

    return newConfig
  }

  const buttons = {
    reset: button(
      () => {
        resetStore()
      },
      { disabled: !changes, order: 1 }
    ),
    'export settings (JSON)': button(
      () => {
        downloadConfig(name, JSON.stringify(getStore()))
      },
      { order: 2 }
    ),
  }

  const buttonsServer = {
    ...buttons,
    'save settings': button(
      () => {
        saveConfig()
      },
      { disabled: !changes, order: 3 }
    ),
  }

  return {
    store,
    updateStore,
    buttons,
    buttonsServer,
  }
}
