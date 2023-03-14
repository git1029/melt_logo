// import axios from 'axios'

// const baseUrl = '/.netlify/functions/configSnippet'

// const getConfig = async () => {
//   const response = await axios.get(baseUrl)
//   return response.data
// }

// const updateConfig = async (config) => {
//   const response = await axios.put(baseUrl, config)
//   return response.data
// }

// export default {
//   getConfig,
//   updateConfig,
// }

import axios from 'axios'

const baseUrl = '/.netlify/functions/configAirtable'

const getConfig = async () => {
  const response = await axios.get(baseUrl)
  return response.data
}

const updateConfig = async (config, password) => {
  const response = await axios.put(baseUrl, { config, password })
  return response.data
}

export default { getConfig, updateConfig }
