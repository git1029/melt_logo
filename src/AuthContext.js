// https://blog.logrocket.com/implementing-serverless-authentication-netlify-identity/
// https://github.com/netlify/netlify-identity-widget#module-api

import { useState, useEffect, createContext } from 'react'
import netlifyIdentity from 'netlify-identity-widget'

export const AuthContext = createContext()

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null)

  useEffect(() => {
    // initialize netlify identity
    netlifyIdentity.init()
    // console.log(netlifyIdentity.gotrue.currentUser)
    // console.log(netlifyIdentity.currentUser)
    // console.log(netlifyIdentity.currentUser())
    const currentUser = netlifyIdentity.currentUser()
    if (currentUser) {
      setUser(currentUser)
    }
  }, [])

  useEffect(() => {
    // update user state after login
    netlifyIdentity.on('login', (user) => {
      setUser(user)
      // close the modal
      netlifyIdentity.close()
    })

    // update user state after logout
    netlifyIdentity.on('logout', () => {
      setUser(null)
    })

    // // update user state on init event
    // netlifyIdentity.on('init', (user) => {
    //   console.log('init', user)
    //   setUser(user)
    // })
  }, [])

  const login = () => {
    netlifyIdentity.open('login')
  }

  const logout = () => {
    netlifyIdentity.logout()
  }

  const contextValues = { user, login, logout }

  return (
    <AuthContext.Provider value={contextValues}>
      {children}
    </AuthContext.Provider>
  )
}
