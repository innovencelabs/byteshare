'use client'

import appwriteService from '@/authentication/appwrite/config'
import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import useAuth from '@/context/useAuth'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import {
  FormEvent,
  HTMLAttributes,
  useState
} from 'react'
import { toast } from 'sonner'

interface UserAuthFormProps extends HTMLAttributes<HTMLDivElement> {}

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const router = useRouter()
  const { setAuthorised } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { authorised, statusLoaded } = useAuth()
  

  const login = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const session = await appwriteService.login(formData)
      if (session) {
        setAuthorised(true)
        router.push('/')
      }
    } catch (err: any) {
      toast.error(err.message)
    }

    setIsLoading(false)
  }

  const loginWithGoogle = (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const successRedirect = process.env.NEXT_PUBLIC_APP_URL
      const failureRedirect = process.env.NEXT_PUBLIC_APP_URL + '/auth/login'

      appwriteService.loginWithGoogle({ successRedirect, failureRedirect })
    } catch (err) {
      toast.error(err.message)
    }

    setIsLoading(false)
  }

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      <form onSubmit={login}>
        <div className="grid gap-8">
          <div className="grid gap-2">
            <Label className="sr-only" htmlFor="email">
              Email
            </Label>
            <Input
              id="email"
              placeholder="Email address"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              required={true}
            />
            <Label className="sr-only" htmlFor="password">
              Password
            </Label>
            <Input
              id="password"
              placeholder="Password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
              autoCapitalize="none"
              autoCorrect="off"
              disabled={isLoading}
              required={true}
            />
            <Button
              className="flex items-center justify-start text-left p-0"
              variant="link"
              type="button"
              onClick={(e) => {
                e.preventDefault()
                if (typeof window !== 'undefined') {
                  sessionStorage.setItem(
                    'FORGOT_PASSWORD_EMAIL',
                    formData.email,
                  )
                }

                router.push('/auth/forgot-password')
              }}
            >
              Forgot Password?
            </Button>
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Sign In with Email
          </Button>
        </div>
      </form>
      <Button
        variant="outline"
        className="md:hidden"
        onClick={() => router.push('/auth/signup')}
      >
        Switch to Create Account
      </Button>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <Button
        variant="outline"
        type="button"
        onClick={loginWithGoogle}
        disabled={isLoading}
      >
        {isLoading ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <svg
            className="mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            viewBox="0 0 48 48"
          >
            <path
              fill="#fbc02d"
              d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12	s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20	s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
            ></path>
            <path
              fill="#e53935"
              d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039	l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
            ></path>
            <path
              fill="#4caf50"
              d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36	c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
            ></path>
            <path
              fill="#1565c0"
              d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571	c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
            ></path>
          </svg>
        )}{' '}
        Continue with Google
      </Button>
    </div>
  )
}
