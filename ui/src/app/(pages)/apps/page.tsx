'use client'
import appwriteService from '@/authentication/appwrite/config'
import { Apps } from '@/components/apps'
import { Header } from '@/components/header'
import useAuth from '@/context/useAuth'
import { useEffect, useState } from 'react'

function AppsPage() {
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')

  const { authorised, statusLoaded } = useAuth()

  useEffect(() => {
    if (statusLoaded) {
      appwriteService.getCurrentUser().then((userResponse) => {
        if (userResponse) {
          setUserEmail(userResponse.email)
          setUserName(userResponse.name)
        }
      })
    }
  }, [statusLoaded])
  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <Header
        authorised={authorised}
        statusLoaded={statusLoaded}
        name={userName}
        email={userEmail}
        dark={false}
      />
      <Apps/>
    </div>
  )
}

export default AppsPage
