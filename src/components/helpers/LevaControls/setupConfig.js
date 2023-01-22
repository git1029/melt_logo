import configService from '../../../services/configService'

export const setupConfig = (
  name,
  defaultConfig,
  useServerConfig,
  updateConfig,
  updateStore,
  controls
) => {
  if (!useServerConfig) {
    // If not using server then load default local config if exists
    // else use local config
    const localConfig = JSON.parse(window.localStorage.getItem('melt_config'))
    if (localConfig !== null && localConfig[name]) {
      console.log('updateStore', localConfig[name])
      updateStore(localConfig[name])
    }

    updateConfig(defaultConfig)
    return
  }

  const fetchConfig = async () => {
    const serverConfig = await configService.getConfig()
    const config = serverConfig[name]

    // TODO: add try/catch
    // Only update Leva store directly if controls are on - else just set state to server config
    // localStorage config (if exists) can take precedence over server config
    // if same values result will be same anyway, if diff then want localstorage
    if (controls) {
      const localConfig = JSON.parse(window.localStorage.getItem('melt_config'))
      if (localConfig !== null && localConfig[name]) {
        // console.log('updateStore', localConfig[name])
        updateStore(localConfig[name])
      } else {
        updateStore(config)
      }
    }

    // still want to use server config as base state config
    updateConfig(config)
  }
  fetchConfig()
}
