'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface WeekNavigatorProps {
   currentWeekLabel: string
}

export default function WeekNavigator({
   currentWeekLabel,
}: WeekNavigatorProps) {
   return (
      <div className="flex items-center justify-between gap-3">
         <div className="flex items-center gap-1 bg-[#F5F2ED] rounded-lg p-1 border border-[#E5E0D8]">
            <button className="p-1.5 hover:bg-white rounded-md text-[#8B857D] transition-colors shadow-xs">
               <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 sm:px-3 text-xs font-semibold text-[#3E3A35] whitespace-nowrap">
               {currentWeekLabel}
            </span>
            <button className="p-1.5 hover:bg-white rounded-md text-[#8B857D] transition-colors shadow-xs">
               <ChevronRight className="w-4 h-4" />
            </button>
         </div>
         <button className="px-3 py-1.5 text-xs font-medium bg-[#F5F2ED] hover:bg-[#EDE8E0] text-[#5A534A] rounded-lg border border-[#E5E0D8] transition-colors whitespace-nowrap">
            Сегодня
         </button>
      </div>
   )
}
