'use client'

import { cn } from '@/lib/utils'
import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import appwriteService from '@/authentication/appwrite/config'
import useAuth from '@/context/useAuth'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { FormEvent, HTMLAttributes, useRef, useState } from 'react'
import { toast } from 'sonner'

interface UserAuthFormProps extends HTMLAttributes<HTMLDivElement> {}

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const userId = searchParams.get('userId')
  const secret = searchParams.get('secret')
  const { setAuthorised } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
  })
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const audioRef = useRef(null)

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.play()
    }
  }

  const login = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const initiatedLoginResponse =
        await appwriteService.initiateMagicURLAuthentication(formData)
      if (initiatedLoginResponse) {
        setFormData({
          email: '',
        })
        playSound()
        toast.info('Login link has been sent to your email.', {
          duration: 6000,
        })
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
          </div>
          <Button disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Login using Email
          </Button>
        </div>
      </form>
      <audio ref={audioRef} src="/popsound.mp3" />
    </div>
  )
}
