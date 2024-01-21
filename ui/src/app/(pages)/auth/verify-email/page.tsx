'use client'
import React, { useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import appwriteService from '@/authentication/appwrite/config'

function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const userId = searchParams.get('userId')
  const secret = searchParams.get('secret')

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams()
      params.set(name, value)

      return params.toString()
    },
    [searchParams],
  )

  useEffect(() => {
    if (userId && secret) {
      appwriteService.completeVerification({ userId, secret })
    }
  }, [userId, secret])
  if (userId && secret) {
    return router.push('/' + '?' + createQueryString('from', 'verify-email'))
  } else {
    return router.push('/')
  }
}

export default VerifyEmailPage
