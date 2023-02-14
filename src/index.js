// import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import { AuthContextProvider } from './components/AdminPage/AuthContext'
import App from './App'
import './css/index.css'

const root = ReactDOM.createRoot(document.getElementById('root'))

root.render(
  // <StrictMode>
  <AuthContextProvider>
    <Router>
      <App />
    </Router>
  </AuthContextProvider>
  // </StrictMode>
)
