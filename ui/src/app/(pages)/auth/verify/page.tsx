'use client'
import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import appwriteService from '@/authentication/appwrite/config'
import { toast } from 'sonner'
import useAuth from '@/context/useAuth'

function VerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setAuthorised } = useAuth()
  const [isMounted, setIsMounted] = useState(false)
  const userId = searchParams.get('userId')
  const secret = searchParams.get('secret')

  useEffect(() => {
    const completeMagicURLAuthentication = async () => {
      if (userId && secret) {
        try {
          await appwriteService.completeMagicURLAuthentication({
            userId,
            secret,
          })
          setAuthorised(true)
          router.push('/')
        } catch (err: any) {
          setAuthorised(false)
          toast.error(err.message, { duration: 9999999 })
        }
      }
    }
    if (isMounted) {
      completeMagicURLAuthentication()
    } else {
      setIsMounted(true)
    }
  }, [isMounted])

  return <></>
}

export default VerifyPage
