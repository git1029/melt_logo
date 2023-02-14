// eslint-disable-next-line no-undef
const axios = require('axios')

// eslint-disable-next-line no-undef
exports.handler = (event, context, callback) => {
  // Get env var values defined in our Netlify site UI
  // eslint-disable-next-line no-undef
  const KEY = process.env.REACT_APP_MELT_API
  // eslint-disable-next-line no-undef
  const URL = process.env.REACT_APP_MELT_URL

  // Here's a function we'll use to define how our response will look like when we call callback
  const pass = (code, body) => {
    console.log(body)
    callback(null, {
      statusCode: code,
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }

  // const getSnippet = async () => {

  // }

  const updateSnippet = async () => {
    const headers = {
      Authorization: `Bearer ${KEY}`,
      'Content-Type': 'application/json',
    }

    const { body } = event

    const { title } = JSON.parse(body)

    if (!title) return pass(404, { error: 'config title required' })

    const snippets = await axios.get(URL, { headers })
    const snippet = snippets.data.find((s) => s.title === title)

    console.log(snippet)

    if (!snippet) return pass(404, { error: 'snippet not found' })

    // Add config validation

    const content = JSON.stringify(body)
    const tag = `<script type="text/json" data-set="${title}">${content}</script>`

    const updatedSnippet = {
      ...snippet,
      general: tag,
    }

    // Also need to parse body to conform to config format - check against variables

    console.log('updatedSnippet', updatedSnippet)

    try {
      const response = await axios.put(`${URL}/${snippet.id}`, updatedSnippet, {
        headers,
      })

      // return pass(200, { snippet: response.data, config: JSON.parse(body) })

      return pass(200, {
        snippet: {
          general: response.data.general,
          title: response.data.title,
        },
        config: JSON.parse(body),
      })
    } catch (error) {
      return pass(500, { error })
    }
  }

  // if (event.httpMethod === 'GET') {
  //   getSnippet()
  // } else
  if (event.httpMethod === 'PUT') {
    updateSnippet()
  }
}

// import axios from 'axios'

// const KEY = process.env.REACT_APP_AIRTABLE_KEY
// const URL = process.env.REACT_APP_AIRTABLE_ENDPOINT_URL

// const getConfig = async () => {
//   const response = await axios.get(URL, {
//     headers: {
//       Authorization: `Bearer ${KEY}`,
//     },
//   })

//   const data = response.data.records.reduce((acc, record) => {
//     const id = record.id
//     const mode = record.fields.mode
//     const config = JSON.parse(record.fields.config)

//     return { ...acc, [mode]: { ...config, id } }
//   }, {})

//   return data
// }

// const updateConfig = async (id, config) => {
//   const headers = {
//     Authorization: `Bearer ${KEY}`,
//     'Content-Type': 'application/json',
//   }

//   // Airtable API patch will update only specified fields in data
//   const response = await axios.patch(`${URL}/${id}`, config, { headers })
//   return response.data
// }

// export default { getConfig, updateConfig }
