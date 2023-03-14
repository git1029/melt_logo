import { useLayoutEffect } from 'react'

export const useToggleFullScreen = (iframeRef) => {
  useLayoutEffect(() => {
    const iframeCurrent = iframeRef.current

    const handleKeyPress = (e) => {
      // console.log(e)

      if (
        iframeCurrent.contentWindow.document.activeElement !==
        iframeCurrent.contentWindow.document.body
      )
        return

      if (e.key === 'f' || e.key === 'F') {
        const adminPage = document.querySelector('.admin-page')
        if (adminPage) adminPage.classList.toggle('fullscreen')
      }
    }

    const handleLoad = () => {
      iframeRef.current.contentWindow.addEventListener(
        'keydown',
        handleKeyPress
      )
    }

    if (iframeCurrent) {
      iframeCurrent.contentWindow.removeEventListener('load', handleLoad)
      iframeCurrent.contentWindow.removeEventListener('keydown', handleKeyPress)

      iframeRef.current.addEventListener('load', handleLoad)
    }

    // TODO: check removal, ensure only runs on admin page (logged in), doesn't work in Strict mode - why? (blocking iframe listeners maybe)
    // Maybe get list of eventlisteners on iframe then remove

    // return () => {
    //   console.log('remove')
    //   iframeCurrent.contentWindow.removeEventListener('load', handleLoad)
    //   iframeCurrent.contentWindow.removeEventListener('keydown', handleKeyPress)
    // }
  }, [iframeRef])
}
