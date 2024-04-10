import React, { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'

const LoadingText = ({text}) => {
  const [dots, setDots] = useState('')

  useEffect(() => {
    const intervalId = setInterval(() => {
      setDots((prevDots) => {
        if (prevDots.length >= 3) {
          return ''
        } else {
          return prevDots + '.'
        }
      })
    }, 500)

    return () => clearInterval(intervalId)
  }, [])

  return <Label>{text}{dots}</Label>
}

export default LoadingText
