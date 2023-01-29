import { useContext } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import { AuthContext } from './AuthContext'
import Home from './components/Home'
import WaterfallAnimation from './components/WaterfallAnimation'

const Admin = () => {
  const { user, login, logout } = useContext(AuthContext)

  console.log(user)

  if (!user) {
    return (
      <div style={{ position: 'relative', zIndex: 1000 }}>
        <p>Please login</p>
        <button onClick={login}>Login</button>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', zIndex: 1000 }}>
      <p>{user.email}</p>
      <button onClick={logout}>Logout</button>
      <h2>Logo</h2>
      <h2>Waterfall</h2>
    </div>
  )
}

const Menu = () => {
  return (
    <div className="nav" style={{ visibility: 'visible' }}>
      <div className="nav-inner">
        <Link to="/">Logo</Link>
        <Link to="/logo-config">Logo Config</Link>
        <Link to="/waterfall">Waterfall</Link>
        <Link to="/waterfall-config">Waterfall Config</Link>
      </div>
    </div>
  )
}

const App = () => {
  // const user = useContext(AuthContext)

  return (
    <>
      <Menu />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/logo-config" element={<Home controls={true} />} />
        <Route
          path="/waterfall"
          element={
            <div>
              <WaterfallAnimation />
            </div>
          }
        />
        <Route
          path="/waterfall-config"
          element={
            <div>
              <WaterfallAnimation controls />
            </div>
          }
        />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </>
  )
}

export default App
