'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface WeekNavigationProps {
   currentWeekLabel: string
   onSetToday: () => void
   onPrevWeek: () => void
   onNextWeek: () => void
}

export function WeekNavigation({
   currentWeekLabel,
   onSetToday,
   onPrevWeek,
   onNextWeek,
}: WeekNavigationProps) {
   return (
      <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
         <button
            type="button"
            onClick={onSetToday}
            className="px-2 py-1 text-[11px] sm:text-xs font-semibold bg-[#F5F2ED] hover:bg-[#EDE8E0] text-[#3E3A35] rounded-lg transition-colors shrink-0"
         >
            Сегодня
         </button>

         <div className="flex items-center shrink-0">
            <button
               type="button"
               onClick={onPrevWeek}
               className="p-1 rounded-md hover:bg-[#F5F2ED] text-[#8B857D] transition-colors"
               aria-label="Предыдущая неделя"
            >
               <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
               type="button"
               onClick={onNextWeek}
               className="p-1 rounded-md hover:bg-[#F5F2ED] text-[#8B857D] transition-colors"
               aria-label="Следующая неделя"
            >
               <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
         </div>

         <span className="hidden sm:inline text-xs sm:text-sm font-bold text-[#3E3A35] truncate ml-1">
            {currentWeekLabel}
         </span>
      </div>
   )
}
