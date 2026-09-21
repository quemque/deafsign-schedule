'use client'

import { useRef } from 'react'

interface UseDaySwipeOptions {
   enabled: boolean
   onPrevDay: () => void
   onNextDay: () => void
   threshold?: number
   maxDuration?: number
}

export function useDaySwipe({
   enabled,
   onPrevDay,
   onNextDay,
   threshold = 40,
   maxDuration = 550,
}: UseDaySwipeOptions) {
   const touchStartX = useRef<number | null>(null)
   const touchStartY = useRef<number | null>(null)
   const touchStartTime = useRef<number | null>(null)

   const handleTouchStart = (e: React.TouchEvent) => {
      if (!enabled) return
      touchStartX.current = e.touches[0].clientX
      touchStartY.current = e.touches[0].clientY
      touchStartTime.current = Date.now()
   }

   const handleTouchEnd = (e: React.TouchEvent) => {
      if (!enabled) return
      if (
         touchStartX.current === null ||
         touchStartY.current === null ||
         touchStartTime.current === null
      ) {
         return
      }

      const touchEndX = e.changedTouches[0].clientX
      const touchEndY = e.changedTouches[0].clientY
      const diffX = touchEndX - touchStartX.current
      const diffY = touchEndY - touchStartY.current
      const duration = Date.now() - touchStartTime.current

      touchStartX.current = null
      touchStartY.current = null
      touchStartTime.current = null

      const isHorizontalSwipe =
         Math.abs(diffX) > threshold &&
         Math.abs(diffX) > Math.abs(diffY) * 1.3 &&
         duration < maxDuration

      if (isHorizontalSwipe) {
         if (diffX < 0) {
            onNextDay()
         } else {
            onPrevDay()
         }
      }
   }

   const handleTouchCancel = () => {
      touchStartX.current = null
      touchStartY.current = null
      touchStartTime.current = null
   }

   return {
      handleTouchStart,
      handleTouchEnd,
      handleTouchCancel,
   }
}
