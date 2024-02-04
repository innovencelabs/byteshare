'use client'
import { useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import appwriteService from '@/authentication/appwrite/config'
import { toast } from 'sonner'

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
      try {
        appwriteService.completeVerification({ userId, secret })
        return router.push(
          '/' + '?' + createQueryString('from', 'verify-email'),
        )
      } catch (err) {
        toast.error(err.message)
      }
    } else {
      return router.push('/')
    }
  }, [userId, secret])
}

export default VerifyEmailPage
