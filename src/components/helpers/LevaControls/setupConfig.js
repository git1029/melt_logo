import { useState } from 'react'
import defaultConfig from './config.json'

// const validateConfig = (config, defaultConfig) => {
//   // Update default config with values of config
//   // validate value types min/max ?
// }

export const useConfig = (name) => {
  const baseConfig = getConfig(name, defaultConfig[name])
  const [config, setConfig] = useState(baseConfig)
  const updateConfig = (newConfig) => setConfig(newConfig)

  return [config, updateConfig]
}

export const getLocalStorageConfig = (name) => {
  // Update store only (set state config to snippet/default so can compare for changes)
  const localConfig = JSON.parse(window.localStorage.getItem('melt_config'))
  if (localConfig !== null && localConfig[name]) {
    return localConfig[name]
  }
  return null
}

export const getConfig = (name, defaultConfig) => {
  // Default all users -> read from snippet
  // To split snippets into logo/waterfall or keep as one?

  // Priority: localStorage (controls only) > snippet > defaultConfig

  // Check if config snippet exists
  const snippet = document.querySelector(
    `[data-set="animation_config_${name}"]`
  )

  if (snippet) {
    // If exists parse + validate and return
    const config = JSON.parse(JSON.parse(snippet.textContent))
    // console.log('snippet', config)

    return config
  } else {
    // else return default
    // console.log('default', defaultConfig)
    // NB: don't need to update store here as store will use defaultConfig to initialize
    return defaultConfig
  }
}

// export const setupConfig = (
//   name,
//   defaultConfig,
//   // useServerConfig,
//   updateConfig,
//   updateStore,
//   controls
// ) => {
//   // Default all users -> read from snippet
//   // To split snippets into logo/waterfall or keep as one?

//   // Priority: localStorage (controls only) > snippet > defaultConfig

//   let localStorageConfig = false

//   if (controls) {
//     // If using controls check localStorage first
//     // Update store only (set state config to snippet/default so can compare for changes)
//     const localConfig = JSON.parse(window.localStorage.getItem('melt_config'))
//     if (localConfig !== null && localConfig[name]) {
//       console.log('localStorage')
//       console.log('updateStore', localConfig[name])
//       updateStore(localConfig[name])
//       localStorageConfig = true
//     }
//   }

//   // Check if config snippet exists
//   const snippet = document.querySelector(
//     `[data-set="animation_config_${name}"]`
//   )

//   console.log(snippet)

//   if (snippet) {
//     // If exists parse + validate and return
//     const config = JSON.parse(JSON.parse(snippet.textContent))
//     console.log('snippet', config)

//     if (controls && !localStorageConfig) updateStore(config)
//     return updateConfig(config)
//   } else {
//     // else return default
//     console.log('default', defaultConfig)
//     // NB: don't need to update store here as store will use defaultConfig to initialize
//     return updateConfig(defaultConfig)
//   }

//   // If controls (i.e. edit mode) then can also use localStorage

//   // if (!useServerConfig) {
//   //   // If not using server then load default local config if exists
//   //   // else use local config
//   //   const localConfig = JSON.parse(window.localStorage.getItem('melt_config'))
//   //   if (localConfig !== null && localConfig[name]) {
//   //     console.log('updateStore', localConfig[name])
//   //     updateStore(localConfig[name])
//   //   }

//   //   updateConfig(defaultConfig)
//   //   return
//   // }

//   // const fetchConfig = async () => {
//   //   const serverConfig = await configService.getConfig()
//   //   const config = serverConfig[name]

//   //   // TODO: add try/catch
//   //   // Only update Leva store directly if controls are on - else just set state to server config
//   //   // localStorage config (if exists) can take precedence over server config
//   //   // if same values result will be same anyway, if diff then want localstorage
//   //   if (controls) {
//   //     const localConfig = JSON.parse(window.localStorage.getItem('melt_config'))
//   //     if (localConfig !== null && localConfig[name]) {
//   //       // console.log('updateStore', localConfig[name])
//   //       updateStore(localConfig[name])
//   //     } else {
//   //       updateStore(config)
//   //     }
//   //   }

//   //   // still want to use server config as base state config
//   //   updateConfig(config)
//   // }
//   // fetchConfig()
// }
