export const downloadConfig = (name, content) => {
  const timestamp = new Date().toISOString()

  // Could add timestamp but best to rely on server time
  // const config = { ...content, lastUpdated: timestamp }

  const element = document.createElement('a')
  element.setAttribute(
    'href',
    'data:text/plain;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(content))
  )
  element.setAttribute('download', `melt_${name}_config_${timestamp}.json`)

  element.style.display = 'none'
  document.body.appendChild(element)

  element.click()

  document.body.removeChild(element)
}
