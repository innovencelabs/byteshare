'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

function Docs() {
  const router = useRouter()
  useEffect(() => {
    return router.push('/docs/developers')
  })
}

export default Docs
