'use client'
import appwriteService from '@/authentication/appwrite/config'
import { AuthProvider } from '@/context/authContext'
import React, { useEffect, useState } from 'react'

const InternalLayout = ({ children }: { children: React.ReactNode }) => {
  const [authorised, setAuthorised] = useState(false)

  useEffect(() => {
    appwriteService.isLoggedIn().then(setAuthorised)
  }, [])

  return (
    <AuthProvider value={{ authorised, setAuthorised }}>
      {children}
    </AuthProvider>
  )
}

export default InternalLayout
