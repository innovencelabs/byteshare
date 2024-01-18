"use client"

import React, { useEffect, useState } from 'react';

export default function NotFound() {
    const [secondsRemaining, setSecondsRemaining] = useState(5);

  useEffect(() => {
    let timeoutId;

    timeoutId = setTimeout(() => {
      window.location.href = '/';
    }, secondsRemaining * 1000);

    const intervalId = setInterval(() => {
      setSecondsRemaining((prev) => prev - 1);
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div>
      <h1>404: Page Not Found</h1>
      <p>
        The page you're looking for doesn't exist. You will be redirected to the
        home page in {secondsRemaining} seconds.
      </p>
      
    </div>
  );
}