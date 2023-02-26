// import axios from 'axios'

// const baseUrl = '/.netlify/functions/config'

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

// eslint-disable-next-line no-undef
const KEY = process.env.REACT_APP_AIRTABLE_KEY
// eslint-disable-next-line no-undef
const URL = process.env.REACT_APP_AIRTABLE_ENDPOINT_URL_CONFIG

const getConfig = async () => {
  const response = await axios.get(URL, {
    headers: {
      Authorization: `Bearer ${KEY}`,
    },
  })

  const data = response.data.records.reduce((acc, record) => {
    const id = record.id
    const mode = record.fields.mode
    const config = JSON.parse(record.fields.config)

    return { ...acc, [mode]: { ...config, id } }
  }, {})

  return data
}

const updateConfig = async (values) => {
  const headers = {
    Authorization: `Bearer ${KEY}`,
    'Content-Type': 'application/json',
  }

  const config = {
    fields: {
      config: JSON.stringify(values),
    },
  }

  // console.log('config', config)

  // Airtable API patch will update only specified fields in data
  const response = await axios.patch(`${URL}/${values.id}`, config, { headers })
  return response.data
}

export default { getConfig, updateConfig }
