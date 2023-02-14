// https://blog.logrocket.com/implementing-serverless-authentication-netlify-identity/
// https://github.com/netlify/netlify-identity-widget#module-api

import { useState, useEffect, useMemo, createContext } from 'react'
import GoTrue from 'gotrue-js'

export const AuthContext = createContext()

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null)

  const auth = useMemo(
    () =>
      new GoTrue({
        APIUrl: 'https://melt-logo.netlify.app/.netlify/identity',
        setCookie: true,
      }),
    []
  )

  console.log('AUTHCONTEXT')

  useEffect(() => {
    console.log('USEEFFECT AUTH')
    setUser(auth.currentUser())
  }, [auth])

  const login = async (email, password) => {
    try {
      const user = await auth.login(email, password, true)
      console.log('login success', user)
      setUser(user)
    } catch (error) {
      console.log('Error logging in', error)
      console.log(JSON.stringify(error))
      throw JSON.stringify(error)
    }
  }

  const logout = async () => {
    const user = auth.currentUser()

    if (user) {
      try {
        await user.logout()
        console.log('logout success')
        setUser(null)
      } catch (error) {
        console.log('logout', error)
      }
    }
  }

  const recovery = async (email) => {
    try {
      const response = await auth.requestPasswordRecovery(email)
      console.log('Recovery email sent', { response })
      // return response
    } catch (error) {
      console.log('Error sending recovery mail: %o', error)
      // return error
      console.log(JSON.stringify(error))
      throw JSON.stringify(error)
    }
  }

  const create = async (token, password) => {
    // console.log(token, password)
    try {
      const response = await auth.acceptInvite(token, password, true)
      console.log('User created', { response })
    } catch (error) {
      console.log('Error accepting invite', error)
      throw JSON.stringify(error)
    }
  }

  const contextValues = { auth, user, login, logout, recovery, create }

  return (
    <AuthContext.Provider value={contextValues}>
      {children}
    </AuthContext.Provider>
  )
}
