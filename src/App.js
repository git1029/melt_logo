import { Link, Route, Routes } from 'react-router-dom'
import Home from './components/Home'
import LogoAnimation from './components/LogoAnimation'

const Menu = () => {
  const padding = {
    paddingRight: 5,
  }
  return (
    <div className="nav">
      <Link style={padding} to="/">
        Home
      </Link>
      <Link style={padding} to="/about">
        About
      </Link>
      <Link style={padding} to="/contact">
        Contact
      </Link>
    </div>
  )
}

const About = () => null
const Contact = () => null

const App = () => {
  return (
    <>
      <Menu />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </>
  )
}

export default App
