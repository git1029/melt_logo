import { Navigate, Route, Routes } from 'react-router-dom'
import Home from './components/Home'
import WaterfallAnimation from './components/WaterfallAnimation'
import LogoAnimation from './components/LogoAnimation'
import AdminPage from './components/AdminPage'

const App = () => {
  return (
    <>
      <Routes>
        <Route
          path="/waterfall"
          element={
            <>
              <WaterfallAnimation />
              <h1>hello</h1>
            </>
          }
        />
        <Route path="/admin" element={<AdminPage />} />
        <Route
          path="/admin/logo"
          element={<LogoAnimation effectRef={null} controls={true} />}
        />
        <Route
          path="/admin/logo-mobile"
          element={
            <LogoAnimation effectRef={null} controls={true} mobile={true} />
          }
        />
        <Route
          path="/admin/waterfall"
          element={<WaterfallAnimation controls={true} />}
        />

        <Route
          path="/admin/waterfall-mobile"
          element={<WaterfallAnimation controls={true} mobile={true} />}
        />
        <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </>
  )
}

export default App
