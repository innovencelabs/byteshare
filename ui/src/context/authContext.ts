import { createContext } from 'react'

export const AuthContext = createContext<{
  authorised: boolean
  setAuthorised: (status: boolean) => void
  statusLoaded: boolean
  setStatusLoaded: (status: boolean) => void
}>({
  authorised: false,
  setAuthorised: () => {},
  statusLoaded: false,
  setStatusLoaded: () => {},
})

export const AuthProvider = AuthContext.Provider

export default AuthContext
