export const downloadConfig = (name, content) => {
  const element = document.createElement('a')
  element.setAttribute(
    'href',
    'data:text/plain;charset=utf-8,' + encodeURIComponent(content)
  )
  const timestamp = new Date(Date.now()).toISOString()
  element.setAttribute('download', `melt_${name}_config_${timestamp}.json`)

  element.style.display = 'none'
  document.body.appendChild(element)

  element.click()

  document.body.removeChild(element)
}
