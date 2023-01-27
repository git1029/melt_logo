import { Link, Route, Routes } from 'react-router-dom'
import Home from './components/Home'
import WaterfallAnimation from './components/WaterfallAnimation'

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
      </Routes>
    </>
  )
}

export default App
