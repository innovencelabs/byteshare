'use client'
import { toast } from 'sonner'
import { useSearchParams } from 'next/navigation'
import useAuth from '@/context/useAuth'
import appwriteService from '@/authentication/appwrite/config'
import { useEffect } from 'react'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'

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
      } else if (
        user &&
        from == 'verify-email' &&
        authorised &&
        user?.emailVerification
      ) {
        toast.success('Email has been successfully verified.')
      }
    })
  }, [authorised])

  const handleSend = () => {
    if (!authorised) {
      toast.error('You are not logged in!')
    }
  }

  return (
    <div className="h-screen flex flex-col justify-between">
      <Header authorised={authorised} />

      <div className="flex-grow flex items-center justify-center">
        <Button
          className="font-semibold text-2xl shadow-lg shadow-blue-500/50 px-20 py-20 bg-blue-500 text-white"
          onClick={() => handleSend()}
        >
          Send Files
        </Button>
      </div>
    </div>
  )
}
