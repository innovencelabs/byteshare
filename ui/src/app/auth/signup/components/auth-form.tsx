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
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const { setAuthorised } = useAuth()

  const create = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (formData.password.length < 8) {
      toast.error('Password should be atleast 8 character.')
      return
    }
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    const isValidPassword = passwordRegex.test(formData.password)
    if (!isValidPassword) {
      toast.error(
        'Password should contain atleast one Upper case, Number and Special character.',
      )
      return
    }

    setIsLoading(true)

    try {
      const userData = await appwriteService.createUserAccount(formData)
      if (userData) {
        setAuthorised(true)
        router.push('/')
      }
    } catch (err: any) {
      setError(err.message)
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
      <Button variant="outline" type="button" disabled={isLoading}>
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
