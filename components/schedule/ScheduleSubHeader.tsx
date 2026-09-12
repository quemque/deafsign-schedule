'use client'

import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'

interface DayItem {
   key: string
   label: string
   short: string
   dateObj: Date
   dateNumber: number
   isToday: boolean
}

interface ScheduleSubHeaderProps {
   currentWeekLabel: string
   weekDates: DayItem[]
   currentDate: Date
   isAdmin: boolean
   onPrevWeek: () => void
   onNextWeek: () => void
   onSetToday: () => void
   onSelectDate: (date: Date) => void
   onOpenCreate: () => void
}

export function ScheduleSubHeader({
   currentWeekLabel,
   weekDates,
   currentDate,
   isAdmin,
   onPrevWeek,
   onNextWeek,
   onSetToday,
   onSelectDate,
   onOpenCreate,
}: ScheduleSubHeaderProps) {
   return (
      <div className="shrink-0 bg-white border-b border-[#E5E0D8] px-4 lg:px-8 py-3 shadow-xs z-30">
         <div className="max-w-7xl mx-auto flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
               <div className="flex items-center justify-between w-full sm:w-auto gap-1 bg-[#F5F2ED] rounded-lg p-1 border border-[#E5E0D8]">
                  <button
                     onClick={onPrevWeek}
                     className="p-1.5 hover:bg-white rounded-md text-[#8B857D] transition-colors shadow-xs"
                  >
                     <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-2 sm:px-4 text-[11px] sm:text-xs font-semibold text-[#3E3A35] whitespace-nowrap text-center flex-1">
                     {currentWeekLabel}
                  </span>
                  <button
                     onClick={onNextWeek}
                     className="p-1.5 hover:bg-white rounded-md text-[#8B857D] transition-colors shadow-xs"
                  >
                     <ChevronRight className="w-4 h-4" />
                  </button>
               </div>

               <div className="flex items-center gap-2 shrink-0">
                  {isAdmin && (
                     <button
                        onClick={onOpenCreate}
                        className="px-3 sm:px-4 py-2 sm:py-1.5 text-[11px] sm:text-xs font-semibold bg-[#8BA888] hover:bg-[#7A9A77] text-white rounded-lg flex items-center gap-1.5 transition-colors"
                     >
                        <Plus className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Добавить</span>
                     </button>
                  )}
                  <button
                     onClick={onSetToday}
                     className="px-3 sm:px-4 py-2 sm:py-1.5 text-[11px] sm:text-xs font-medium bg-[#F5F2ED] hover:bg-[#EDE8E0] text-[#5A534A] rounded-lg border border-[#E5E0D8] transition-colors"
                  >
                     Сегодня
                  </button>
               </div>
            </div>

            <div className="flex sm:hidden w-full gap-1 justify-between mt-1">
               {weekDates.map((day) => {
                  const isSelected =
                     day.dateObj.toDateString() === currentDate.toDateString()
                  return (
                     <button
                        key={day.key}
                        onClick={() => onSelectDate(day.dateObj)}
                        className={`flex flex-col items-center justify-center flex-1 py-1.5 rounded-lg border transition-all ${
                           isSelected
                              ? 'bg-[#8BA888] text-white border-[#8BA888] shadow-sm'
                              : 'bg-transparent text-[#8B857D] border-transparent hover:bg-[#F5F2ED]'
                        }`}
                     >
                        <span
                           className={`text-[10px] font-medium mb-0.5 ${isSelected ? 'text-white/90' : 'text-[#B0A89E]'}`}
                        >
                           {day.short}
                        </span>
                        <span
                           className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-[#3E3A35]'}`}
                        >
                           {day.dateNumber}
                        </span>
                     </button>
                  )
               })}
            </div>
         </div>
      </div>
   )
}
