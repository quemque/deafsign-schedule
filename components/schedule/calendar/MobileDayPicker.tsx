'use client'

import type { DayItem } from '@/utils/scheduleTime'

interface MobileDayPickerProps {
   weekDates: DayItem[]
   currentDate: Date
   onSelectDate: (date: Date) => void
}

export function MobileDayPicker({
   weekDates,
   currentDate,
   onSelectDate,
}: MobileDayPickerProps) {
   const currentDayTimestamp = currentDate.toDateString()

   const getDayButtonClassName = (isSelected: boolean, isToday: boolean) => {
      const base =
         'flex-1 min-w-[36px] py-1 px-0.5 rounded-lg flex flex-col items-center justify-center transition-all'

      if (isSelected) {
         return `${base} bg-[#8BA888] text-white shadow-xs`
      }
      if (isToday) {
         return `${base} bg-[#E8F0E8] text-[#3E3A35]`
      }
      return `${base} bg-[#FAF8F5] text-[#5A534A] hover:bg-[#F0EDE8]`
   }

   return (
      <div className="flex sm:hidden items-center justify-between gap-1 overflow-x-auto custom-scrollbar pb-0.5">
         {weekDates.map((day) => {
            const isSelected =
               day.dateObj.toDateString() === currentDayTimestamp

            return (
               <button
                  key={day.key}
                  type="button"
                  onClick={() => onSelectDate(day.dateObj)}
                  className={getDayButtonClassName(isSelected, day.isToday)}
               >
                  <span className="text-[9px] font-medium opacity-80 uppercase leading-none">
                     {day.short}
                  </span>
                  <span className="text-[11px] font-bold mt-0.5 leading-none">
                     {day.dateNumber}
                  </span>
               </button>
            )
         })}
      </div>
   )
}
