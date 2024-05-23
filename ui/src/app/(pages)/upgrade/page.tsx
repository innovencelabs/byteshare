'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeftIcon } from '@radix-ui/react-icons'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

function UpgradePage() {
  const [email, setEmail] = useState('')

  const router = useRouter()

  const handleSubscribe = async (e) => {
    e.preventDefault()
    const apiURL = process.env.NEXT_PUBLIC_API_BASE_URL + '/subscribe'
    const apiKey = process.env.NEXT_PUBLIC_API_KEY
    

    const subscribeJSON = {
      email: email,
    }

    await fetch(apiURL, {
      method: 'POST',
      body: JSON.stringify(subscribeJSON),
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
    })
    setEmail('')
    toast.success('You have been subscribed!')
  }

  return (
    <>
      <form onSubmit={handleSubscribe}>
        <div className="bg-darkbg flex h-screen justify-center items-center z-10">
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
              <Button
                className="bg-blue-600 hover:bg-blue-400 text-white"
                type="submit"
              >
                Subscribe
              </Button>
            </div>
            <Button
              variant="ghost"
              className="flex justify-center mx-auto mt-5 w-[100%] text-slate-300"
              onClick={(e) => {
                e.preventDefault() 
                router.push("/")
              }
              }
            >
              <ArrowLeftIcon className="mr-1"/>
              Go to Home
            </Button>
          </div>
        </div>
      </form>
    </>
  )
}

export default UpgradePage
