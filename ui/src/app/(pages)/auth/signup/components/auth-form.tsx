'use client'

import { cn } from '@/lib/utils'
import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import appwriteService from '@/authentication/appwrite/config'
import useAuth from '@/context/useAuth'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { FormEvent, HTMLAttributes, useCallback, useState } from 'react'
import { toast } from 'sonner'

interface UserAuthFormProps extends HTMLAttributes<HTMLDivElement> {}

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  })

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const { setAuthorised } = useAuth()

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams()
      params.set(name, value)

      return params.toString()
    },
    [searchParams],
  )

  const create = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    setIsLoading(true)

    try {
      const userData = await appwriteService.createUserAccount(formData)
      if (userData) {
        setAuthorised(true)
        await appwriteService.initiateVerification()
        router.push('/' + '?' + createQueryString('from', 'signup'))
      }
    } catch (err: any) {
      toast.error(err.message)
    }

    setIsLoading(false)
  }

  const signupWithGoogle = (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const successRedirect = process.env.NEXT_PUBLIC_APP_URL
      const failureRedirect = process.env.NEXT_PUBLIC_APP_URL + '/auth/signup'

      appwriteService.loginWithGoogle({ successRedirect, failureRedirect })
    } catch (err) {
      toast.error(err.message)
    }

    setIsLoading(false)
  }

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      <form onSubmit={create}>
        <div className="grid gap-8">
          <div className="grid gap-2">
            <Label className="sr-only" htmlFor="name">
              Name
            </Label>
            <Input
              id="name"
              placeholder="Your Name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              autoCapitalize="true"
              autoCorrect="off"
              disabled={isLoading}
              required={true}
            />
            <Label className="sr-only" htmlFor="email">
              Email
            </Label>
            <Input
              id="email"
              placeholder="Email Address"
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
            <Label className="sr-only" htmlFor="email">
              Email
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
          </div>
          <Button disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Sign Up with Email
          </Button>
        </div>
      </form>
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
        onClick={signupWithGoogle}
        disabled={isLoading}
      >
        {isLoading ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.google className="mr-2 h-4 w-4" />
        )}{' '}
        Sign up with Google
      </Button>
    </div>
  )
}
