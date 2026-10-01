'use client'

import { X } from 'lucide-react'

interface HeaderProps {
   subject: string
   baseColor: string
   displayDate: Date
   hasExplicitDate: boolean
   isRescheduled: boolean
   isRecurring: boolean
   totalLessons?: number | null
   onClose: () => void
}

export function LessonDetailsHeader({
   subject,
   baseColor,
   displayDate,
   hasExplicitDate,
   isRescheduled,
   isRecurring,
   totalLessons,
   onClose,
}: HeaderProps) {
   const formattedDate = displayDate.toLocaleDateString('ru-RU', {
      timeZone: hasExplicitDate ? undefined : 'UTC',
      day: 'numeric',
      month: 'long',
   })

   return (
      <div
         style={{ backgroundColor: `${baseColor}15` }}
         className="p-4 sm:p-5 border-b border-[#E5E0D8] relative shrink-0"
      >
         <button
            type="button"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 p-2 rounded-full bg-white/80 hover:bg-white text-[#8B857D] transition-colors"
         >
            <X className="w-4 h-4" />
         </button>

         <div className="flex items-center gap-1.5 mb-2 pr-8 flex-wrap">
            {isRescheduled && (
               <span className="text-[10px] font-semibold px-2 py-0.5 sm:py-1 rounded-md bg-amber-500 text-white shadow-2xs">
                  ПЕРЕНЕСЕНО
               </span>
            )}

            {isRecurring && (
               <span
                  style={{
                     color: baseColor,
                     borderColor: `${baseColor}50`,
                  }}
                  className="text-[10px] font-semibold px-2 py-0.5 sm:py-1 rounded-md bg-white border"
               >
                  {totalLessons
                     ? `КУРС (${totalLessons} ЗАНЯТИЙ)`
                     : 'ЕЖЕНЕДЕЛЬНО'}
               </span>
            )}

            <span className="text-[10px] sm:text-[11px] font-medium text-[#8B857D] bg-white px-2 py-0.5 sm:py-1 rounded-md border border-[#E5E0D8]">
               {formattedDate}
            </span>
         </div>

         <h2 className="text-base sm:text-lg font-extrabold text-[#3E3A35] pr-8 leading-tight">
            {subject}
         </h2>
      </div>
   )
}
