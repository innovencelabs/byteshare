import { useEffect, useState } from 'react'

export default function RealtimeTimer({ expiresAt }) {
  const calculateTimeLeft = () => {
    const now = Math.floor(Date.now() / 1000)
    const difference = expiresAt - now

    let timeLeft = {}

    if (difference > 0) {
      timeLeft = {
        minutes: Math.floor(difference / 60),
        seconds: difference % 60,
      }
    }

    return timeLeft
  }

  const [timeLeft, setTimeLeft] = useState<any>(calculateTimeLeft())

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer) 
  }, [expiresAt])

  const isLessThanOneMinute = timeLeft.minutes === 0 && timeLeft.seconds < 60

  return (
    <div>
      {timeLeft.minutes !== undefined ? (
        <span className={isLessThanOneMinute ? 'text-red-500': 'text-green-500' }>
          {String(timeLeft.minutes).padStart(2, '0')}:
          {String(timeLeft.seconds).padStart(2, '0')}
        </span>
      ) : (
        <span className='text-red-500'>Expired</span>
      )}
    </div>
  )
}
