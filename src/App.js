import { Link, Route, Routes } from 'react-router-dom'
import Home from './components/Home'
import WaterfallAnimation from './components/WaterfallAnimation'

const Menu = () => {
  return (
    <div className="nav">
      <div className="nav-inner">
        <Link to="/">Logo</Link>
        <Link to="/waterfall">Waterfall</Link>
      </div>
    </div>
  )
}

// const About = () => null
// const Contact = () => null

const App = () => {
  return (
    <>
      <Menu />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/waterfall"
          element={
            <div>
              <WaterfallAnimation controls />
            </div>
          }
        />
        {/* <Route path="/contact" element={<Contact />} /> */}
      </Routes>
    </>
  )
}

export default App
