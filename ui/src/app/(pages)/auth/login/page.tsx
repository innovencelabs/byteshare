import Image from 'next/image'
import { Metadata } from 'next'
import Link from 'next/link'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { UserAuthForm } from './components/auth-form'

export const metadata: Metadata = {
  title: 'Login',
  description: 'Login page',
}

function LoginPage() {
  return (
    <>
      <div className="md:hidden py-8"></div>
      <div className="container relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <Link
          href="/auth/signup"
          className={cn(
            buttonVariants({ variant: 'default' }),
            'hidden md:inline-block absolute right-4 top-4 lg:right-8 lg:top-8',
          )}
        >
          Create Account
        </Link>
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
          <div className="absolute inset-0 bg-zinc-900" />
          <Link
            className="relative z-20 flex items-center text-lg font-medium"
            href="/"
          >
            {/* <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 h-6 w-6"
            >
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
            </svg> */}
            <Image
              src="/byteshare.png"
              alt="ByteShare Logo"
              width={32}
              height={32}
            />
            ByteShare
          </Link>
          <div className="relative z-20 mt-auto"></div>
        </div>
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-lightgray-foreground text-2xl font-semibold tracking-tight">
                Login to your account
              </h1>
              <p className="text-sm text-lightgray">
                Welcome back to ByteShare!
              </p>
            </div>
            <UserAuthForm />
          </div>
        </div>
      </div>
    </>
  )
}

export default LoginPage
