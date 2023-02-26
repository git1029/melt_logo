import { useEffect, useCallback, useState } from 'react'
import { button, levaStore } from 'leva'
import { downloadConfig } from '../../helpers/LevaControls/downloadConfig'
import configService from '../../../services/configService'

export const useLevaHelpers = (name, defaults, config, updateConfig) => {
  const [changes, setChanges] = useState(false)

  const getStore = useCallback(() => {
    // console.log('GET STORE')
    // NB: store.data contains list of all leva control values (not grouped by logo/watefall mode)
    // For this reason control names should also be unique across modes
    const data = levaStore.getData()
    const paths = Object.keys(data)
    const storeData = { ...defaults }

    paths.forEach((path) => {
      const p = path.split('.').pop()
      if (storeData[p] !== undefined) {
        storeData[p] = data[path].value
      }
    })

    return storeData
  }, [defaults])

  const updateLocalStorage = useCallback(() => {
    const values = getStore()

    // console.log('UPDATELOCALSTORAGE')
    let localConfig = JSON.parse(window.localStorage.getItem('melt_config'))
    if (localConfig === null) localConfig = {}
    if (localConfig[name] === undefined) localConfig[name] = {}
    localConfig[name] = values
    window.localStorage.setItem('melt_config', JSON.stringify(localConfig))
  }, [getStore, name])

  const checkChanges = useCallback(() => {
    // console.log('UPDATECHANGES')
    const values = getStore()
    const paths = Object.keys(values)

    let hasChanged = false
    paths.forEach((p) => {
      if (typeof values[p] === 'object') {
        //  Check object values (NB: this only caters for 1 level deep)
        const nestedKeys = Object.keys(values[p])
        nestedKeys.forEach((key) => {
          if (values[p][key] !== config[p][key]) hasChanged = true
        })
      } else {
        if (config[p] !== values[p]) hasChanged = true
      }
    })

    setChanges(hasChanged)
  }, [getStore, config])

  const resetStore = useCallback(() => {
    // console.log('RESET STORE')
    // Reset to config (not localStorage)
    const data = levaStore.getData()
    const paths = Object.keys(data)

    paths.forEach((path) => {
      const p = path.split('.').pop()
      if (config[p] !== undefined) {
        // Reset to last saved config
        levaStore.setValueAtPath(path, config[p])
      }
    })

    updateLocalStorage()
    setChanges(false)
    // updateChanges()
  }, [config, updateLocalStorage])

  const downloadStore = useCallback(() => {
    downloadConfig(name, JSON.stringify(getStore()))
  }, [getStore, name])

  const handleEditEnd = useCallback(() => {
    updateLocalStorage()
    checkChanges()
  }, [updateLocalStorage, checkChanges])

  const saveStore = async () => {
    // Only if diff to values in snippet

    // console.log('SAVESTORE')
    const values = getStore()
    // console.log('values', values)

    // Only send sub config (i.e. logo or waterfall)
    try {
      const savedConfig = await configService.updateConfig(values)
      // console.log('saved levaHelpers', savedConfig)
      // console.log('saved levaHelpers', JSON.parse(savedConfig.fields.config))

      // updateConfig(savedConfig.config) // snippet
      updateConfig(JSON.parse(savedConfig.fields.config)) // airtable
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    const paths = levaStore.getVisiblePaths()
    const subscriptions = []

    // Initialize values
    // console.log('INITIALIZING VALUES')
    paths.forEach((path) => {
      const p = path.split('.').pop()
      if (defaults[p] !== undefined) {
        levaStore.setValueAtPath(path, defaults[p])
        subscriptions.push(levaStore.subscribeToEditEnd(path, handleEditEnd))
      }
    })

    checkChanges()

    return () => {
      // console.log('**** UNSUBSCRIBING')

      // Unsubscribe to listeners on unmount
      subscriptions.forEach((s) => s())
      // // Should dispose paths too?
      // levaStore.disposePaths(levStore.getVisiblePaths())
    }
  }, [defaults, handleEditEnd, checkChanges])

  const buttonsSchema = {
    reset: button(
      () => {
        resetStore()
      },
      {
        disabled: !changes,
        order: 1,
      }
    ),
    'export settings (JSON)': button(
      () => {
        downloadStore()
      },
      { order: 2 }
    ),
    'save settings': button(
      () => {
        saveStore()
      },
      { disabled: !changes, order: 3 }
    ),
  }

  return { buttons: buttonsSchema, changes }
}
