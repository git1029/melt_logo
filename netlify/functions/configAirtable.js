// eslint-disable-next-line no-undef
const axios = require('axios')

// eslint-disable-next-line no-undef
exports.handler = (event, context, callback) => {
  // Get env var values defined in our Netlify site UI
  // eslint-disable-next-line no-undef
  const KEY = process.env.REACT_APP_AIRTABLE_KEY
  // eslint-disable-next-line no-undef
  const URL = process.env.REACT_APP_AIRTABLE_ENDPOINT_URL_CONFIG

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

      // console.log(response.data.records)

      const data = response.data.records
        // .filter((record) => Object.keys(record.fields).length > 0)
        .reduce((acc, record) => {
          const { id, fields } = record
          const { mode, config } = fields

          // Only return field if has mode and config set in fields
          if (mode === undefined || config === undefined) return acc

          return { ...acc, [mode]: { ...JSON.parse(config), id } }
        }, {})

      return pass(200, data)
    } catch (error) {
      return pass(500, { error, data: null })
    }
  }

  const updateConfig = async () => {
    const { body } = event
    // console.log('body', body)

    const config = JSON.parse(body)
    // console.log('typeof', typeof id)
    // console.log('id', id)
    // console.log(`${URL}/${id}`)

    // Check for record on Airtable
    try {
      await axios.get(`${URL}/${config.id}`, { headers })
    } catch (error) {
      return pass(404, { error: 'Airtable record not found' })
    }

    const updatedConfig = {
      fields: {
        config: body,
      },
    }

    try {
      // Airtable API patch will update only specified fields in data
      const response = await axios.patch(`${URL}/${config.id}`, updatedConfig, {
        headers,
      })

      const data = JSON.parse(response.data.fields.config)

      // console.log('data', data)
      // return response.data

      // return pass(200, { snippet: response.data, config: JSON.parse(body) })

      // return pass(200, {
      //   snippet: {
      //     general: response.data.general,
      //     title: response.data.title,
      //   },
      //   config: JSON.parse(body),
      // })

      return pass(200, data)
    } catch (error) {
      return pass(500, { error, data: null })
    }

    // const response = await axios.get(URL, { headers })

    // console.log('response', response.data)

    // const config = {
    //   fields: {
    //     config: JSON.stringify(body),
    //   },
    // }

    // validate

    // console.log('headers', headers)
    // console.log('config', config)

    //   // Airtable API patch will update only specified fields in data
    //   const response = await axios.patch(`${URL}/${values.id}`, config, { headers })
    //   return response.data

    // if (!title) return pass(404, { error: 'config title required' })

    // const snippets = await axios.get(URL, { headers })
    // const snippet = snippets.data.find((s) => s.title === title)

    // console.log(snippet)

    // if (!snippet) return pass(404, { error: 'snippet not found' })

    // // Add config validation

    // const content = JSON.stringify(body)
    // const tag = `<script type="text/json" data-set="${title}">${content}</script>`

    // const updatedSnippet = {
    //   ...snippet,
    //   general: tag,
    // }

    // // Also need to parse body to conform to config format - check against variables

    // console.log('updatedSnippet', updatedSnippet)

    // try {
    //   const response = await axios.put(`${URL}/${snippet.id}`, updatedSnippet, {
    //     headers,
    //   })

    //   // return pass(200, { snippet: response.data, config: JSON.parse(body) })

    //   return pass(200, {
    //     snippet: {
    //       general: response.data.general,
    //       title: response.data.title,
    //     },
    //     config: JSON.parse(body),
    //   })
    // } catch (error) {
    //   return pass(500, { error })
    // }
  }

  if (event.httpMethod === 'GET') {
    getConfig()
  } else if (event.httpMethod === 'PUT') {
    updateConfig()
  }
}
