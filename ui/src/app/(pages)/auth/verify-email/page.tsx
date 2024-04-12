'use client'
import appwriteService from '@/authentication/appwrite/config'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect } from 'react'
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
    const completeVerification = async () => {
      if (userId && secret) {
        try {
          await appwriteService.completeVerification({ userId, secret })
          return router.push(
            '/' + '?' + createQueryString('from', 'verify-email'),
          )
        } catch (err) {
          toast.error(err.message)
        }
      } else {
        return router.push('/')
      }
    }

    completeVerification()
  }, [userId, secret])
}

export default VerifyEmailPage
