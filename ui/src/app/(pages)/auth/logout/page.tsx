'use client'

import appwriteService from '@/authentication/appwrite/config'
import useAuth from '@/context/useAuth'
import { useRouter } from 'next/navigation'

function Logout() {
  const router = useRouter()
  const { authorised, setAuthorised } = useAuth()

  if (authorised) {
    appwriteService.logout()
    setAuthorised(false)
    router.push('/')
  }

  return <></>
}

export default Logout
