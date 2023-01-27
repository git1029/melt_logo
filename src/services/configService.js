import axios from 'axios'

const updateConfig = async (config) => {
  const response = await axios.put(
    // 'http://localhost:3000/.netlify/functions/config',
    'https://melt-logo.netlify.app/.netlify/functions/config',
    config
  )

  return response.data
}

export default { updateConfig }
