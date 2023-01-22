import axios from 'axios'

const KEY = process.env.REACT_APP_AIRTABLE_KEY
const URL = process.env.REACT_APP_AIRTABLE_ENDPOINT_URL

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

const updateConfig = async (id, config) => {
  const headers = {
    Authorization: `Bearer ${KEY}`,
    'Content-Type': 'application/json',
  }

  // Airtable API patch will update only specified fields in data
  const response = await axios.patch(`${URL}/${id}`, config, { headers })
  return response.data
}

export default { getConfig, updateConfig }
