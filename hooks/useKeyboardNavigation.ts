'use client'

import { useEffect } from 'react'

interface UseKeyboardNavigationOptions {
   enabled: boolean
   onPrev: () => void
   onNext: () => void
}

export function useKeyboardNavigation({
   enabled,
   onPrev,
   onNext,
}: UseKeyboardNavigationOptions) {
   useEffect(() => {
      if (!enabled) return

      const handleKeyDown = (event: KeyboardEvent) => {
         const activeElement = document.activeElement as HTMLElement | null
         const isEditingText =
            activeElement &&
            (activeElement.tagName === 'INPUT' ||
               activeElement.tagName === 'TEXTAREA' ||
               activeElement.isContentEditable)

         if (isEditingText) return

         if (event.key === 'ArrowLeft') {
            event.preventDefault()
            onPrev()
         } else if (event.key === 'ArrowRight') {
            event.preventDefault()
            onNext()
         }
      }

      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
   }, [enabled, onPrev, onNext])
}
