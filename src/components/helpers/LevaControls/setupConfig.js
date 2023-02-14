import { useState } from 'react'
import defaultConfig from './config.json'

// const validateConfig = (config, defaultConfig) => {
//   // Update default config with values of config
//   // validate value types min/max ?
// }

export const useConfig = (name) => {
  // console.log('USECONFIG')
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

export const getConfig = (name) => {
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
    return defaultConfig[name]
  }
}
