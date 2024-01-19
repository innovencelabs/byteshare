import { createContext } from 'react'

export const AuthContext = createContext<{
  authorised: boolean
  setAuthorised: (status: boolean) => void
}>({
  authorised: false,
  setAuthorised: () => {},
})

export const AuthProvider = AuthContext.Provider

export default AuthContext
