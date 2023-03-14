import { useState, useEffect } from 'react'
import defaultConfig from './config.json'
import configService from '../../../services/configService'

// const validateConfig = (config, defaultConfig) => {
//   // Update default config with values of config
//   // validate value types min/max ?
// }

export const useConfig = (name) => {
  // console.log('USECONFIG')

  // AIRTABLE
  const [config, setConfig] = useState(defaultConfig[name])
  const updateConfig = (newConfig) => setConfig(newConfig)
  // console.log('config', config)

  useEffect(() => {
    const getServerConfig = async () => {
      try {
        const response = await configService.getConfig()
        // console.log('configservice', response)
        // console.log('configservice', response[name])

        if (response !== null && response[name] !== undefined) {
          // console.log('setting config')
          if (response[name].id !== defaultConfig[name].id) {
            console.log(
              `Mismatching record ids: ${response[name].id}, ${defaultConfig[name].id}`
            )
          }
          setConfig(response[name])
        } else {
          console.log(`Config ${name} not found on server`)
        }
      } catch (error) {
        console.log(
          error.response.data.error ? error.response.data.error : 'Server error'
        )
      }
    }

    getServerConfig()
  }, [name])

  // SNIPPET
  // const baseConfig = getConfig(name, defaultConfig[name])
  // console.log('baseConfig', baseConfig)
  // const [config, setConfig] = useState(baseConfig)
  // const updateConfig = (newConfig) => setConfig(newConfig)

  return [config, updateConfig]
}

export const getLocalStorageConfig = (name) => {
  // Update store only (set state config to snippet/default so can compare for changes)
  const localConfig = JSON.parse(window.localStorage.getItem('melt_config'))
  if (localConfig !== null && localConfig[name]) {
    if (localConfig[name].id !== defaultConfig[name].id) {
      console.log(
        `Mismatching record ids: ${localConfig[name].id}, ${defaultConfig[name].id}`
      )
    }

    return localConfig[name]
  }
  return null
}

// export const getConfig = (name) => {
//   // Default all users -> read from snippet
//   // To split snippets into logo/waterfall or keep as one?

//   // Priority: localStorage (controls only) > snippet > defaultConfig

//   // Check if config snippet exists
//   const snippet = document.querySelector(
//     `[data-set="animation_config_${name}"]`
//   )

//   if (snippet) {
//     // If exists parse + validate and return
//     const config = JSON.parse(JSON.parse(snippet.textContent))
//     // console.log('snippet', config)

//     return config
//   } else {
//     // else return default
//     // console.log('default', defaultConfig)
//     // NB: don't need to update store here as store will use defaultConfig to initialize
//     return defaultConfig[name]
//   }
// }
