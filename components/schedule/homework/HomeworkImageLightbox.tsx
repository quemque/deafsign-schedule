'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'

interface HomeworkImageLightboxProps {
   src: string | null
   onClose: () => void
}

export function HomeworkImageLightbox({
   src,
   onClose,
}: HomeworkImageLightboxProps) {
   useEffect(() => {
      if (src) {
         document.body.style.overflow = 'hidden'
      } else {
         document.body.style.overflow = ''
      }
      return () => {
         document.body.style.overflow = ''
      }
   }, [src])

   useEffect(() => {
      const handleEsc = (e: KeyboardEvent) => {
         if (e.key === 'Escape') onClose()
      }
      if (src) {
         window.addEventListener('keydown', handleEsc)
      }
      return () => {
         window.removeEventListener('keydown', handleEsc)
      }
   }, [src, onClose])

   if (!src) return null

   return (
      <div
         className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/95 p-4 sm:p-8 select-none backdrop-blur-sm animate-in fade-in duration-200"
         onClick={onClose}
         onContextMenu={(e) => e.preventDefault()}
         style={{ WebkitTouchCallout: 'none' }}
      >
         <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors z-50 focus:outline-none"
         >
            <X className="w-6 h-6 sm:w-8 sm:h-8" />
         </button>

         <div
            className="relative max-w-full max-h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
         >
            <img
               src={src}
               alt="Просмотр материала"
               draggable={false}
               className="max-w-full max-h-[85vh] sm:max-h-[90vh] object-contain rounded-lg shadow-2xl pointer-events-none"
               style={{ WebkitTouchCallout: 'none' }}
            />

            <div
               className="absolute inset-0 z-10 cursor-default"
               onContextMenu={(e) => e.preventDefault()}
               style={{ WebkitTouchCallout: 'none' }}
            />
         </div>
      </div>
   )
}
