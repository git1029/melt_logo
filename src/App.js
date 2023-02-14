import { useContext } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthContext } from './components/AdminPage/AuthContext'
import Home from './components/Home'
import WaterfallAnimation from './components/WaterfallAnimation'
import LogoAnimation from './components/LogoAnimation'
import AdminPage from './components/AdminPage'

const App = () => {
  const { auth } = useContext(AuthContext)
  const user = auth.currentUser()

  return (
    <>
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
      </Routes>
    </>
  )
}

export default App
