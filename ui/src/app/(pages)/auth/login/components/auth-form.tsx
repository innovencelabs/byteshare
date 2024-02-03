'use client'

import { cn } from '@/lib/utils'
import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import appwriteService from '@/authentication/appwrite/config'
import useAuth from '@/context/useAuth'
import { useRouter } from 'next/navigation'
import React, { FormEvent, HTMLAttributes, useState } from 'react'
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
          <Button disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Sign In with Email
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
      <Button variant="outline" type="button" disabled={isLoading}>
        {isLoading ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.google className="mr-2 h-4 w-4" />
        )}{' '}
        Sign in with Google
      </Button>
    </div>
  )
}
