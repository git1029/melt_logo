import axios from 'axios'

const KEY = process.env.REACT_APP_AIRTABLE_KEY
const BASE = process.env.REACT_APP_BASE_NUM
const URL = process.env.REACT_APP_AIRTABLE_ENDPOINT_URL

const getConfig = async () => {
  // const data = await axios.get(URL, {
  //   headers: {
  //     Authorization: `Bearer ${KEY}`,
  //   },
  // })
  // return data.data
}

const updateConfig = async (config) => {
  // const headers = {
  //   headers: {
  //     Authorization: `Bearer ${KEY}`,
  //   },
  // }
  // const data = await axios.put(URL, config, headers)
  // return data.data
}

export default { getConfig, updateConfig }
