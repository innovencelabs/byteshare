'use client'
import useAuth from '@/context/useAuth'
import { useRouter } from 'next/navigation'
import React from 'react'

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()
  const { authorised, statusLoaded } = useAuth()

  if (statusLoaded && !authorised) {
    router.push('/auth/login')
  } else if (!statusLoaded) {
    return <></>
  }
  return children
}

export default ProtectedLayout
