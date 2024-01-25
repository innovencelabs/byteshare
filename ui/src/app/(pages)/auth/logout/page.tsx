'use client'

import React, { useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import appwriteService from '@/authentication/appwrite/config'
import useAuth from '@/context/useAuth'

function Logout() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { authorised, setAuthorised } = useAuth()

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams()
      params.set(name, value)

      return params.toString()
    },
    [searchParams],
  )

  if (authorised) {
    appwriteService.logout()
    setAuthorised(false)
    router.push('/' + '?' + createQueryString('from', 'logout'))
  }

  return <></>
}

export default Logout
