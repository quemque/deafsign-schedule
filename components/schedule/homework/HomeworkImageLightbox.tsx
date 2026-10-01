'use client'

import { X } from 'lucide-react'

interface HomeworkImageLightboxProps {
   src: string | null
   alt?: string
   onClose: () => void
}

export function HomeworkImageLightbox({
   src,
   alt = 'Материал к уроку',
   onClose,
}: HomeworkImageLightboxProps) {
   if (!src) return null

   return (
      <div
         className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-150 select-none"
         onClick={onClose}
      >
         <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            aria-label="Закрыть"
         >
            <X className="w-5 h-5" />
         </button>

         <div
            className="relative max-w-5xl max-h-[90vh] w-auto h-auto flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
         >
            <img
               src={src}
               alt={alt}
               className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
            />
         </div>
      </div>
   )
}
