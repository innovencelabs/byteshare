'use client'
import appwriteService from '@/authentication/appwrite/config'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { toast } from 'sonner'

function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const userId = searchParams.get('userId')
  const secret = searchParams.get('secret')

  useEffect(() => {
    const completeVerification = async () => {
      if (userId && secret) {
        try {
          await appwriteService.completeVerification({ userId, secret })
          toast.success('Email has been successfully verified.')
          return router.push(
            '/',
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
