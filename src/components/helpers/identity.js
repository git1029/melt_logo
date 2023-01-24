import netlifyIdentity from 'netlify-identity-widget'

export const loginUser = (setUser) => {
  if (netlifyIdentity && netlifyIdentity.currentUser()) {
    const { id, role, user_metadata } = netlifyIdentity.currentUser()

    const user = JSON.stringify({
      id,
      role,
      ...user_metadata,
    })

    setUser({ user })

    window.localStorage.setItem('currentUser', user)
  }
}

export const logoutUser = (setUser) => {
  setUser(null)
  window.localStorage.removeItem('currentUser')
}
