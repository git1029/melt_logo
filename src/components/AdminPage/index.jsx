import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { SmallButton, IFrame, Button } from './Styled'
import { useToggleFullScreen } from '../helpers/toggleFullScreen'
import './Admin.css'
import logo from './assets/favicon.png'

const AdminHeader = ({ children }) => {
  return (
    <div className="admin-header">
      <div className="admin-header-img">
        <img src={logo} width="67" height="67" />
      </div>
      {children}
    </div>
  )
}

const AdminReturn = () => {
  return (
    <div className="admin-return">
      <Link to="/">
        <SmallButton light style={{ padding: 0, border: 'none' }}>
          ⭠ Return to homepage
        </SmallButton>
      </Link>
    </div>
  )
}

const AdminNav = ({ mode, updateMode }) => {
  const buttons = [
    { path: 'logo', label: 'Logo', ref: useRef(), className: '' },
    {
      path: 'logo-mobile',
      label: 'Logo (Mobile)',
      ref: useRef(),
    },
    { path: 'waterfall', label: 'Waterfall', ref: useRef(), className: '' },
    {
      path: 'waterfall-mobile',
      label: 'Waterfall (Mobile)',
      ref: useRef(),
      className: '',
    },
  ]

  buttons.find((b) => b.path === mode).className = 'selected'

  const handleClick = (target) => {
    buttons
      .filter((b) => b !== target.ref.current)
      .forEach((b) => b.ref.current.classList.remove('selected'))
    target.ref.current.classList.add('selected')
    window.localStorage.setItem('melt_config_page', target.path)
    updateMode(target.path)
  }

  return (
    <div className="admin-nav">
      <div className="admin-nav-buttons">
        {buttons.map((b) => (
          <Button
            light
            className={b.className}
            key={b.path}
            ref={b.ref}
            onClick={() => handleClick(b)}
          >
            {b.label}
          </Button>
        ))}
      </div>
    </div>
  )
}

const AdminPageView = ({ mode, iframeRef }) => {
  return (
    <>
      {/* <div className="admin-animation-container">{displayMode()}</div> */}
      {/* <IFrame mode={mode} /> */}
      <div className="admin-view">
        <IFrame
          ref={iframeRef}
          className={`iframe iframe-${mode}`}
          src={`/admin/${mode}`}
        ></IFrame>
        <div className="admin-view-footer">
          <AdminReturn />
          <div className="admin-helper">
            <div>
              <span>D</span> show/hide controls
            </div>
            <div>
              <span>F</span> toggle fullscreen
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

const AdminPage = () => {
  const localPage = window.localStorage.getItem('melt_config_page')

  const [mode, setMode] = useState(localPage === null ? 'logo' : localPage)
  const iframeRef = useRef()
  useToggleFullScreen(iframeRef)

  const updateMode = (value) => setMode(value)

  // const displayMode = () => {
  //   if (mode === 'logo')
  //     return <LogoAnimation effectRef={null} controls={true} />
  //   else if (mode === 'waterfall') return <WaterfallAnimation controls={true} />
  //   else return null
  // }

  return (
    <>
      <div className="admin-page user">
        <div className="admin-panel">
          <AdminHeader>
            <AdminNav mode={mode} updateMode={updateMode} />
          </AdminHeader>
          <AdminPageView mode={mode} iframeRef={iframeRef} />
        </div>
      </div>
    </>
  )
}

export default AdminPage
