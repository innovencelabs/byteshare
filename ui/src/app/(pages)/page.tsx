'use client'
import { toast } from 'sonner'
import { useRouter, useSearchParams } from 'next/navigation'
import useAuth from '@/context/useAuth'
import appwriteService from '@/authentication/appwrite/config'
import Image from 'next/image'
import { useEffect } from 'react'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'

export default function Home() {
  const router = useRouter()
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
      router.push('/auth/login')
    }
  }

  return (
    <div className="h-screen flex flex-col justify-between">
      <Header authorised={authorised} />

      <div className="flex-grow flex items-center justify-center z-10">
        <Button
          className="font-semibold text-3xl shadow-lg  px-20 py-20 bg-slate-300 text-blue-800 hover:bg-blue-100 hover:text-blue-800 rounded-2xl"
          onClick={() => handleSend()}
        >
          Send
        </Button>
      </div>
      <div className="absolute inset-0">
        <Image
          src="/background.jpg"
          alt="Background Image"
          layout="fill"
          objectFit="cover"
          className="z-0 "
        />
      </div>
      <div className="absolute inset-0 bg-black opacity-5 z-1"></div>

      {/* <div className="fixed bottom-0 left-0 mb-4 ml-4 z-10">
        <Image
          src="/bottom.jpg"
          alt="Your Image"
          className=""
          width={300}
          height={300}
        />
      </div> */}
    </div>
  )
}
