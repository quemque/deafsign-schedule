'use client'

import { useRef, RefObject } from 'react'

interface UseScheduleSwipeOptions {
   containerRef: RefObject<HTMLDivElement | null>
   isMobile: boolean
   isDayMode: boolean
   onPrevDay: () => void
   onNextDay: () => void
   onPrevWeek: () => void
   onNextWeek: () => void
   threshold?: number
   maxDuration?: number
}

export function useScheduleSwipe({
   containerRef,
   isMobile,
   isDayMode,
   onPrevDay,
   onNextDay,
   onPrevWeek,
   onNextWeek,
   threshold = 45,
   maxDuration = 500,
}: UseScheduleSwipeOptions) {
   const touchStartX = useRef<number | null>(null)
   const touchStartY = useRef<number | null>(null)
   const touchStartTime = useRef<number | null>(null)
   const scrollStartLeft = useRef<number>(0)

   const handleTouchStart = (e: React.TouchEvent) => {
      touchStartX.current = e.touches[0].clientX
      touchStartY.current = e.touches[0].clientY
      touchStartTime.current = Date.now()

      if (containerRef.current) {
         scrollStartLeft.current = containerRef.current.scrollLeft
      }
   }

   const handleTouchEnd = (e: React.TouchEvent) => {
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

      const isHorizontalGesture =
         Math.abs(diffX) > threshold &&
         Math.abs(diffX) > Math.abs(diffY) * 1.3 &&
         duration < maxDuration

      if (!isHorizontalGesture) return

      if (isDayMode) {
         if (diffX < 0) {
            onNextDay()
         } else {
            onPrevDay()
         }
         return
      }

      if (!isMobile) {
         if (diffX < 0) {
            onNextWeek()
         } else {
            onPrevWeek()
         }
         return
      }

      const container = containerRef.current
      if (!container) return

      const maxScrollLeft = container.scrollWidth - container.clientWidth
      const isAtLeftEdge = scrollStartLeft.current <= 10
      const isAtRightEdge = scrollStartLeft.current >= maxScrollLeft - 10

      if (diffX > 0 && isAtLeftEdge) {
         onPrevWeek()
      } else if (diffX < 0 && isAtRightEdge) {
         onNextWeek()
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
