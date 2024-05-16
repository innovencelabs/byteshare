'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

function UpgradePage() {
  const [email, setEmail] = useState('')

  const router = useRouter()

  const handleSubscribe = async (e) => {
    e.preventDefault()
    const apiURL = process.env.NEXT_PUBLIC_API_BASE_URL + '/secured/subscribe'
    

    const subscribeJSON = {
      email: email,
    }

    const securedAccessBody = {
      jwtToken: "",
      apiURL: apiURL,
      method: 'POST',
    }

    const securedAccessResponse = await fetch('/api/securedAccess', {
      method: 'POST',
      body: JSON.stringify(securedAccessBody),
    })

    const securedAccessResponseJSON = await securedAccessResponse.json()

    

    await fetch(apiURL, {
      method: 'POST',
      body: JSON.stringify(subscribeJSON),
      headers: securedAccessResponseJSON["headers"],
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
              
              className="flex justify-center mx-auto mt-5 w-[100%] bg-slate-700 hover:bg-slate-800 text-slate-300 hover:text-slate-400"
              onClick={(e) => {
                e.preventDefault() 
                router.push("/")
              }
              }
            >
              Go to Home
            </Button>
          </div>
        </div>
      </form>
    </>
  )
}

export default UpgradePage
