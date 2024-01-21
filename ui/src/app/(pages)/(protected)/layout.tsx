'use client'
import useAuth from '@/context/useAuth'
import { useRouter } from 'next/navigation'
import React from 'react'

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()
  const { authorised } = useAuth()

  if (!authorised) {
    router.push('/auth/login')
  }
  return children
}

export default ProtectedLayout
