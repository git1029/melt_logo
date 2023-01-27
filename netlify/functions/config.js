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
    callback(null, {
      statusCode: code,
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }

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

    // Add try/catch
    const response = await axios.put(`${URL}/${snippet.id}`, updatedSnippet, {
      headers,
    })

    return pass(200, response.data)
  }

  if (event.httpMethod === 'PUT') {
    updateSnippet()
  }
}
