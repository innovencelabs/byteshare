'use client'

import { cn } from '@/lib/utils'
import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import appwriteService from '@/authentication/appwrite/config'
import { useRouter } from 'next/navigation'
import React, { FormEvent, HTMLAttributes, useState } from 'react'
import { useToast } from '@/components/ui/use-toast'

interface ForgotPasswordFormProps extends HTMLAttributes<HTMLDivElement> {}

export function ForgotPasswordForm({
  className,
  ...props
}: ForgotPasswordFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const forgotPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await appwriteService.initiateForgotPassword(formData)
      if (response) {
        toast({
          description: 'Verification email has been sent.',
        })
      }
    } catch (err: any) {
      console.log(err)
      setError(err.message)
    }

    setIsLoading(false)
  }

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      <form onSubmit={forgotPassword}>
        <div className="grid gap-8">
          <div className="grid gap-2">
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
          </div>
          <Button disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Get verification email
          </Button>
        </div>
      </form>
      <Button
        disabled={isLoading}
        variant="ghost"
        onClick={() => router.back()}
      >
        Go back
      </Button>
    </div>
  )
}

export default ForgotPasswordForm
