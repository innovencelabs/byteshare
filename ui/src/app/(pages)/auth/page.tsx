'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

function Auth() {
  const router = useRouter()
  useEffect(() => {
    return router.push('/auth/login')
  })
}

export default Auth
