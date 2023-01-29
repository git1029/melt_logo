import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import './css/index.css'
import App from './App'
import { AuthContextProvider } from './AuthContext'

const root = ReactDOM.createRoot(document.getElementById('root'))

root.render(
  <StrictMode>
    <AuthContextProvider>
      <Router>
        <App />
      </Router>
    </AuthContextProvider>
  </StrictMode>
)
