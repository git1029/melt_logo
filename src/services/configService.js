import axios from 'axios'

const baseUrl = '/.netlify/functions/config'

const getConfig = async () => {
  const response = await axios.get(baseUrl)
  return response.data
}

const updateConfig = async (config) => {
  const response = await axios.put(baseUrl, config)
  return response.data
}

export default { getConfig, updateConfig }
