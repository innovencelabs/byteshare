'use client'

import appwriteService from '@/authentication/appwrite/config'
import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useRouter, useSearchParams } from 'next/navigation'
import { FormEvent, HTMLAttributes, useEffect, useState } from 'react'
import { toast } from 'sonner'

interface ResetPasswordFormProps extends HTMLAttributes<HTMLDivElement> {}

export function ResetPasswordForm({
  className,
  ...props
}: ResetPasswordFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    userId: '',
    secret: '',
    password: '',
    confirmPassword: '',
  })

  const [isLoading, setIsLoading] = useState<boolean>(false)

  let userId = searchParams.get('userId')
  let secret = searchParams.get('secret')
  if (!userId || !secret) {
    router.push('/')
  }

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      userId: userId,
      secret: secret,
    }))
  }, [])

  const resetPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    userId = searchParams.get('userId')
    secret = searchParams.get('secret')

    setIsLoading(true)

    try {
      const response = await appwriteService.completeForgotPassword(formData)
      if (response) {
        router.push('/auth/login')
      }
    } catch (err: any) {
      toast.error(err.message)
    }

    setIsLoading(false)
  }

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      <form onSubmit={resetPassword}>
        <div className="grid gap-8">
          <div className="grid gap-2">
            <Label className="sr-only" htmlFor="password">
              Password
            </Label>
            <Input
              id="password"
              placeholder="New Password"
              type="password"
              value={formData.password}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }}
              autoCorrect="off"
              disabled={isLoading}
              required={true}
            />
            <Label className="sr-only" htmlFor="password">
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              placeholder="Confirm Password"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }}
              autoCorrect="off"
              disabled={isLoading}
              required={true}
            />
          </div>
          <Button disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Reset Password
          </Button>
        </div>
      </form>
    </div>
  )
}

export default ResetPasswordForm
