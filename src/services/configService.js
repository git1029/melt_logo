import axios from 'axios'

const baseUrl = '/.netlify/functions/config'

const updateConfig = async (config) => {
  const response = await axios.put(baseUrl, config)

  // console.log(response.data)
  return response.data
}

export default { updateConfig }
