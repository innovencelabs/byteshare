'use client'
import { toast } from 'sonner'
import { useSearchParams } from 'next/navigation'
import useAuth from '@/context/useAuth'
import appwriteService from '@/authentication/appwrite/config'
import { useEffect } from 'react'

export default function Home() {
  const { authorised } = useAuth()
  const searchParams = useSearchParams()
  const from = searchParams.get('from')

  useEffect(() => {
    appwriteService.getCurrentUser().then((user) => {
      if (user && from == 'signup' && authorised && !user?.emailVerification) {
        toast.info(
          'Please check your email for a verification link to complete your registration.',
        )
      }
    })
  }, [authorised])

  return <main className="flex justify-center">Hello</main>
}
