'use client'

import { useState, useEffect } from 'react'

export const useCurrentTime = () => {
   const [currentTime, setCurrentTime] = useState<Date>(new Date())

   useEffect(() => {
      const timer = setInterval(() => {
         setCurrentTime(new Date())
      }, 60000)
      return () => clearInterval(timer)
   }, [])

   return currentTime
}
