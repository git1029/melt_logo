import { useState, useContext, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from './AuthContext'
import AdminForm from './AdminForm'
import { Text, SmallButton, IFrame, Button } from './Styled'
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

const AdminPageLoggedOut = () => {
  return (
    <>
      <div className="admin-page">
        <div className="admin-login">
          <AdminHeader />
          <div className="admin-login-form-container">{<AdminForm />}</div>
          <AdminReturn />
        </div>
      </div>
    </>
  )
}

const AdminNav = ({ updateMode }) => {
  const buttons = [
    { text: 'Logo', ref: useRef(), className: 'selected' },
    { text: 'Waterfall', ref: useRef(), className: '' },
  ]

  const handleClick = (target) => {
    buttons
      .filter((b) => b !== target.ref.current)
      .forEach((b) => b.ref.current.classList.remove('selected'))
    target.ref.current.classList.add('selected')
    updateMode(target.text.toLowerCase())
  }

  return (
    <div className="admin-nav">
      <div className="admin-nav-buttons">
        {buttons.map((b) => (
          <Button
            light
            className={b.className}
            key={b.text}
            ref={b.ref}
            onClick={() => handleClick(b)}
          >
            {b.text}
          </Button>
        ))}
      </div>
    </div>
  )
}

const AdminLogout = () => {
  const { auth, logout } = useContext(AuthContext)
  const user = auth.currentUser()

  const navigate = useNavigate()

  const handleLogout = async (event) => {
    event.preventDefault()

    await logout()
    navigate('/admin')
  }
  return (
    <div className="admin-logout">
      <div className="admin-logout-user">
        <div className="avatar"></div>
        <Text style={{ margin: '0', padding: '0' }}>
          {user.user_metadata.full_name}
        </Text>
      </div>
      <SmallButton
        light
        style={{ padding: '0', border: 'none' }}
        type="button"
        onClick={handleLogout}
      >
        Logout
      </SmallButton>
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

const AdminPageLoggedIn = () => {
  const [mode, setMode] = useState('logo')
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
            <AdminNav updateMode={updateMode} />
            <AdminLogout />
          </AdminHeader>
          <AdminPageView mode={mode} iframeRef={iframeRef} />
        </div>
      </div>
    </>
  )
}

const AdminPage = () => {
  const { auth } = useContext(AuthContext)
  const user = auth.currentUser()

  if (!user) {
    return <AdminPageLoggedOut />
  }

  return <AdminPageLoggedIn />
}

export default AdminPage
