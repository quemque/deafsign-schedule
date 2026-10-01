'use client'

interface LessonBadgesProps {
   isRescheduled: boolean
   isRecurring: boolean
   lessonIndex: number | null
   totalLessons?: number | null
   isCompact: boolean
}

export function LessonBadges({
   isRescheduled,
   isRecurring,
   lessonIndex,
   totalLessons,
   isCompact,
}: LessonBadgesProps) {
   const rescheduleLabel = isCompact ? 'П' : 'ПЕРЕНОС'
   const recurringLabel = totalLessons
      ? `${lessonIndex ?? '–'}${isCompact ? '' : `/${totalLessons}`}`
      : isCompact
        ? '•'
        : 'ЦИКЛ'

   return (
      <div className="flex items-center gap-0.5 sm:gap-1">
         {isRescheduled && (
            <span className="font-bold px-0.5 sm:px-1 py-0.2 rounded-xs bg-amber-500 text-white text-[7px] sm:text-[8px] leading-tight">
               {rescheduleLabel}
            </span>
         )}

         {isRecurring && (
            <span className="font-bold px-0.5 sm:px-1 py-0.2 rounded-xs bg-white/75 text-[#3E3A35] text-[7px] sm:text-[8px] leading-tight">
               {recurringLabel}
            </span>
         )}
      </div>
   )
}
