'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import React, { useState } from 'react'
import { toast } from 'sonner'

function UpgradePage() {
  const [email, setEmail] = useState('')

  const handleSubscribe = async (e) => {
    e.preventDefault()
    const apiBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL

    const subscribeJSON = {
      email: email,
    }

    await fetch(apiBaseURL + '/subscribe', {
      method: 'POST',
      body: JSON.stringify(subscribeJSON),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    toast.success('You have been subscribed!')
  }

  return (
    <>
      <form onSubmit={handleSubscribe}>
        <div className="bg-[#303EA2] flex h-screen justify-center items-center z-10">
          <div className="bg-transparent p-8 rounded-md shadow-md max-w-sm">
            <h4 className="text-2xl font-semibold mb-4 text-white">
              Subscribe to Waitinglist and get{' '}
              <span className="text-yellow-500">20% off</span> on launch
            </h4>
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="bg-white"
                required
              />
              <Button className="bg-black hover:bg-slate-800" type="submit">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </form>
    </>
  )
}

export default UpgradePage
