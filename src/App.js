import { useContext } from 'react'
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  // useNavigate,
} from 'react-router-dom'
import { AuthContext } from './components/AdminPage/AuthContext'
import Home from './components/Home'
import WaterfallAnimation from './components/WaterfallAnimation'
import LogoAnimation from './components/LogoAnimation'
import AdminPage from './components/AdminPage'
import { CreateUserForm } from './components/AdminPage/AdminForm'

const App = () => {
  const { auth } = useContext(AuthContext)
  const user = auth.currentUser()

  const location = useLocation()

  const showCreateUser = () => {
    if (location.hash.includes('#invite_token=')) {
      const hash = location.hash.split('#invite_token=')
      if (hash.length === 2) {
        const token = hash[1]
        if (token.length > 0) {
          return <CreateUserForm token={token} />
        }
      }
    }

    return null
  }

  return (
    <>
      <Routes>
        <Route
          path="/logo-config"
          // element={<Home controls={true}
          element={<LogoAnimation effectRef={null} controls={true} />}
        />
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
        <Route path="/admin" element={<AdminPage />} />
        <Route
          path="/admin/logo"
          element={
            user ? (
              <LogoAnimation effectRef={null} controls={true} />
            ) : (
              <Navigate to="/admin" replace />
            )
          }
        />
        <Route
          path="/admin/waterfall"
          element={
            user ? (
              <WaterfallAnimation controls={true} />
            ) : (
              <Navigate to="/admin" replace />
            )
          }
        />
        <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
        <Route path="/" element={<Home />} />
      </Routes>

      {showCreateUser()}
    </>
  )
}

export default App
