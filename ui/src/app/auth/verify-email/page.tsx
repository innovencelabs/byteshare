'use client'
import React from 'react'
import { useSearchParams } from 'next/navigation'

function VerifyEmailPage() {
  const searchParams = useSearchParams()

  const userId = searchParams.get('userId')
  const secret = searchParams.get('secret')

  return <div>VerifyEmailPage</div>
}

export default VerifyEmailPage
