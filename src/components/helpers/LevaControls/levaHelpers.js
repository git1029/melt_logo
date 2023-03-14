import { useEffect, useCallback, useState, useLayoutEffect } from 'react'
import { button, levaStore } from 'leva'
import { downloadConfig } from '../../helpers/LevaControls/downloadConfig'
import configService from '../../../services/configService'

// import { AuthContext } from '../../AdminPage/AuthContext'

export const useLevaHelpers = (name, defaults, config, updateConfig) => {
  const [changes, setChanges] = useState(false)

  // eslint-disable-next-line no-undef
  // const REACT_APP_MELT_PASSWORD = process.env.REACT_APP_MELT_PASSWORD
  const localPassword = window.localStorage.getItem('melt_config_password')

  const setMessage = (text, classes = null) => {
    const message = document.getElementById('passwordMessage')
    if (message === null) return

    const classList =
      classes === null || classes.length === 0 ? ['show'] : ['show', ...classes]

    message.classList.add(...classList)
    message.textContent = text

    if (timeoutId !== null) clearTimeout(timeoutId)

    timeoutId = setTimeout(() => {
      message.classList.remove(...classList)
    }, 5000)
  }

  const passwordInput = document.getElementById('controls.password')
  useLayoutEffect(() => {
    if (passwordInput === null) return
    passwordInput.setAttribute('type', 'password')
    const span = document.createElement('span')
    // span.style.marginRight = '5px'
    span.style.padding = '5px'
    span.style.cursor = 'pointer'
    span.style.fontSize = '16px'
    span.style.marginTop = '-3px'
    span.innerHTML = '&#9678'
    span.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type')
      passwordInput.setAttribute('type', type === 'text' ? 'password' : 'text')
    })
    passwordInput.insertAdjacentElement('afterend', span)
    const div = document.createElement('div')
    div.setAttribute('id', 'passwordMessage')
    div.textContent = 'Password required'
    if (passwordInput.parentNode && passwordInput.parentNode.parentNode) {
      passwordInput.parentNode.parentNode.insertAdjacentElement('afterend', div)
    }
  }, [passwordInput])

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
  }, [updateLocalStorage, config])

  const downloadStore = useCallback(() => {
    // downloadConfig(name, JSON.stringify(getStore()))
    downloadConfig(name, getStore())
  }, [getStore, name])

  const handleEditEnd = useCallback(() => {
    updateLocalStorage()
    checkChanges()
  }, [updateLocalStorage, checkChanges])

  let timeoutId = null

  const saveStore = async () => {
    // Only if diff to values in snippet

    // // PASSWORD CHECK
    // // eslint-disable-next-line no-undef
    // const password = process.env.SAVE_PASSWORD
    // // Check localstorage for passowrd
    // const localPassword = JSON.parse(window.localStorage.getItem('melt_save_key'))
    // if (localPassword === null) {
    //   // pop up
    // } else {
    //   // check if matches
    //   if (localPassword !== password) {
    //     window.localStorage.removeItem('melt_save_key')
    //     // pop up
    //   }
    // }

    // // console.log('SAVESTORE')
    const values = getStore()
    // console.log('values', values)

    const password = levaStore.get('controls.password')

    // todo: sanitize input
    // // Check password characters
    // password.match(/^[0-9a-zA-Z.,@$!%*#?&]+$/)

    if (!password || password === '') {
      setMessage('password required')
      return
    }

    // Only send sub config (i.e. logo or waterfall)
    try {
      const savedConfig = await configService.updateConfig(values, password)
      // console.log('saved levaHelpers', savedConfig)
      // console.log('saved levaHelpers', JSON.parse(savedConfig.fields.config))

      // Set password in localStorage
      const localPassword = window.localStorage.getItem('melt_config_password')
      if (localPassword !== password) {
        // console.log('updating localstorage password')
        window.localStorage.setItem('melt_config_password', password)
      }

      setMessage('save successful', ['success'])

      // updateConfig(savedConfig.config) // snippet
      updateConfig(savedConfig) // airtable
    } catch (error) {
      // console.log(error)

      setMessage(error.response.data.error)
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
    password: {
      value:
        localPassword !== null && typeof localPassword === 'string'
          ? localPassword
          : '',
    },
    'save settings': button(
      () => {
        saveStore()
      },
      { disabled: !changes, order: 3 }
    ),
  }

  return { buttons: buttonsSchema, changes }
}
