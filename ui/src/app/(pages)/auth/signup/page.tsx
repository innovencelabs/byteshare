import Image from 'next/image'
import { Metadata } from 'next'
import Link from 'next/link'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { UserAuthForm } from './components/auth-form'

export const metadata: Metadata = {
  title: 'Signup',
  description: 'Signup page',
}

function SignupPage() {
  return (
    <>
      <div className="md:hidden py-8"></div>
      <div className="container relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <Link
          href="/auth/login"
          className={cn(
            buttonVariants({ variant: 'default' }),
            'hidden md:inline-block absolute right-4 top-4 lg:right-8 lg:top-8',
          )}
        >
          Login
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
          <div className="relative z-20 mt-auto">
            {/* <blockquote className="space-y-2">
              <p className="text-lg">
                &ldquo;This library has saved me countless hours of work and
                helped me deliver stunning designs to my clients faster than
                ever before.&rdquo;
              </p>
              <footer className="text-sm">Sofia Davis</footer>
            </blockquote> */}
          </div>
        </div>
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-lightgray-foreground text-2xl font-semibold tracking-tight">
                Create your account
              </h1>
              <p className="text-sm text-lightgray">
                Create your account by entering email and password.
              </p>
            </div>
            <UserAuthForm />
            <p className="px-8 text-center text-sm text-lightgray">
              By continuing, you agree to our{' '}
              <Link
                href="/auth/terms"
                className="underline underline-offset-4 hover:text-primary"
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                href="/auth/privacy"
                className="underline underline-offset-4 hover:text-primary"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default SignupPage
