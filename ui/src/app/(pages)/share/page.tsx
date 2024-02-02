'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

function Share() {
  const router = useRouter()
  useEffect(() => {
    return router.push('/')
  })
}

export default Share
