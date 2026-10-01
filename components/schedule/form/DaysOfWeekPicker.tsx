'use client'

import { DAYS_OF_WEEK } from '@/constants/schedule'

interface DaysOfWeekPickerProps {
   selectedDays: string[]
   onToggleDay: (dayKey: string) => void
}

export function DaysOfWeekPicker({
   selectedDays,
   onToggleDay,
}: DaysOfWeekPickerProps) {
   return (
      <div>
         <label className="text-[10px] font-medium text-[#8B857D] mb-1.5 block pl-1">
            Дни недели курса
         </label>
         <div className="flex gap-1.5 flex-wrap">
            {DAYS_OF_WEEK.map((day) => {
               const isSelected = selectedDays.includes(day.key)

               return (
                  <button
                     key={day.key}
                     type="button"
                     onClick={() => onToggleDay(day.key)}
                     className={`flex-1 min-w-[40px] py-2 text-[11px] sm:text-xs font-semibold rounded-xl border transition-all ${
                        isSelected
                           ? 'bg-[#8BA888] text-white border-[#8BA888] shadow-sm shadow-[#8BA888]/20'
                           : 'bg-[#F5F2ED] text-[#5A534A] border-[#E5E0D8] hover:bg-[#EDE8E0]'
                     }`}
                  >
                     {day.short}
                  </button>
               )
            })}
         </div>
      </div>
   )
}
