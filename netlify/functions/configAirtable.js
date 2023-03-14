// eslint-disable-next-line no-undef
const axios = require('axios')

// eslint-disable-next-line no-undef
exports.handler = (event, context, callback) => {
  // Get env var values defined in our Netlify site UI
  // eslint-disable-next-line no-undef
  const KEY = process.env.REACT_APP_AIRTABLE_KEY
  // eslint-disable-next-line no-undef
  const URL = process.env.REACT_APP_AIRTABLE_ENDPOINT_URL_CONFIG
  // eslint-disable-next-line no-undef
  const PASSWORD = process.env.REACT_APP_MELT_PASSWORD

  const headers = {
    Authorization: `Bearer ${KEY}`,
    'Content-Type': 'application/json',
  }

  // Here's a function we'll use to define how our response will look like when we call callback
  const pass = (code, body) => {
    // console.log(body)
    callback(null, {
      statusCode: code,
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }

  const getConfig = async () => {
    try {
      const response = await axios.get(URL, { headers })

      if (!response.data || !response.data.records) {
        return pass(404, { error: 'no data/records found' })
      }

      const data = response.data.records.reduce((acc, record) => {
        const { id, fields } = record
        const { mode, config } = fields

        // Only return field if has mode and config set in fields
        if (mode === undefined || config === undefined) return acc

        return { ...acc, [mode]: { ...JSON.parse(config), id } }
      }, {})

      return pass(200, data)
    } catch (error) {
      return pass(500, { error: 'unable to fetch data' })
    }
  }

  const updateConfig = async () => {
    const { body } = event

    const { config, password } = JSON.parse(body)
    // todo: validate/sanitize input
    // console.log(config, password)

    // Check password
    if (!password || password === '' || password !== PASSWORD) {
      return pass(401, { error: 'wrong password' })
    }

    // Check for record on Airtable
    try {
      await axios.get(`${URL}/${config.id}`, { headers })
    } catch (error) {
      return pass(404, { error: 'airtable record not found' })
    }

    const updatedConfig = {
      fields: {
        config: JSON.stringify({
          ...config,
          lastUpdated: new Date().toISOString(),
        }),
      },
    }

    try {
      // Airtable API patch will update only specified fields in data
      const response = await axios.patch(`${URL}/${config.id}`, updatedConfig, {
        headers,
      })

      const data = JSON.parse(response.data.fields.config)

      return pass(200, data)
    } catch (error) {
      // console.log(error)
      return pass(500, { error: 'something went wrong, saving failed' })
    }
  }

  if (event.httpMethod === 'GET') {
    getConfig()
  } else if (event.httpMethod === 'PUT') {
    updateConfig()
  }
}
