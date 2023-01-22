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
  // console.log(levaStore)

  const [init, setInit] = useState(null)

  // console.log('----useLevaHelpers config:', config)

  // let location = useLocation()

  // useEffect(() => {
  //   const alertUser = (e) => {
  //     if (!changes) return
  //     e.preventDefault()
  //     e.returnValue = ''
  //   }
  //   console.log('add beforeunload')
  //   window.addEventListener('beforeunload', alertUser)
  //   return () => {
  //     console.log('remove beforeunload')
  //     window.removeEventListener('beforeunload', alertUser)
  //   }
  // }, [changes, location])

  const updateLocalStorage = () => {
    let localConfig = JSON.parse(window.localStorage.getItem('melt_config'))
    if (localConfig === null) localConfig = {}
    if (localConfig[name] === undefined) localConfig[name] = {}
    const values = getStore()
    console.log('values', values)
    localConfig[name] = values
    console.log('----levaHelpers [store] updating localStorage', localConfig)
    window.localStorage.setItem('melt_config', JSON.stringify(localConfig))
  }

  useEffect(() => {
    if (init === null) return

    // console.log(init)
    const data = store.data
    const paths = Object.keys(data)
    paths.forEach((path) => {
      const p = path.split('.').pop()
      if (init[p] !== undefined) {
        // console.log(p)
        levaStore.setValueAtPath(path, init[p])
        levaStore.subscribeToEditEnd(path, updateLocalStorage)
      }
    })
  }, [init])

  // useEffect(() => {
  //   // Want to keep localstorage up to date but not initially after config first set else would just be the same
  //   // console.log('----levaHelpers [store] config-verison', config.version)
  //   if (!server) {
  //     // updateLocalStorage()
  //   } else if (config.version !== 'default') {
  //     // console.log('updating localStorage')
  //     updateLocalStorage()
  //   }
  // }, [store])

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
                // console.log(p, key)
                hasChanged = true
              }
            }
          })
        } else {
          if (config[p] !== data[path].value) {
            // console.log(p)
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

    // Add try/catch
    // console.log('saving config')
    const savedConfig = await configService.updateConfig(values.id, newConfig)
    console.log('saved', savedConfig)

    // Need to update state config so it gets passed back to useLevaHelpers else change check will always compare to original config (defaults)
    // Don't want to updateConfig on every leva change else it'll always look like it's up to date vs server

    // // Update localStorage - updated on each store change already
    // updateLocalStorage()

    // Update scene state
    updateConfig(values)
  }

  const resetStore = () => {
    // console.log('----useLevaHelpers RESET store', config)

    const data = store.data
    const paths = Object.keys(data)

    paths.forEach((path) => {
      const p = path.split('.').pop()
      if (config[p] !== undefined) {
        // Reset to defaultConfig or reset to last saved config (server)??
        levaStore.setValueAtPath(path, config[p])
        // levaStore.setValueAtPath(path, defaultConfig[p])
      }
    })

    updateLocalStorage()

    // const values = getStore()
    // updateConfig(values)
  }

  const updateStore = (values) => {
    // console.log('----useLevaHelpers update store', values)

    // const data = store.data
    // const paths = Object.keys(data)
    // console.log('update', data)

    // paths.forEach((path) => {
    //   const p = path.split('.').pop()
    //   // console.log(
    //   //   serverConfig[p],
    //   //   data[path].value,
    //   //   serverConfig[p] === data[path].value
    //   // )
    //   if (values[p] !== undefined && values[p] !== data[path].value) {
    //     levaStore.setValueAtPath(path, values[p])
    //   }
    // })

    console.log('setInit(true)', values)
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
