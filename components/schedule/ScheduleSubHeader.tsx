'use client'

import { useMemo } from 'react'
import {
   ChevronLeft,
   ChevronRight,
   Plus,
   Calendar,
   CalendarDays,
} from 'lucide-react'

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
   mobileViewMode?: 'day' | 'week'
   onMobileViewModeChange?: (mode: 'day' | 'week') => void
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
   mobileViewMode = 'day',
   onMobileViewModeChange,
   onPrevWeek,
   onNextWeek,
   onSetToday,
   onSelectDate,
   onOpenCreate,
}: ScheduleSubHeaderProps) {
   const monthLabel = useMemo(() => {
      const raw = currentDate.toLocaleDateString('ru-RU', {
         month: 'long',
         year: 'numeric',
      })
      const clean = raw.replace(/\s*г\.?$/, '')
      return clean.charAt(0).toUpperCase() + clean.slice(1)
   }, [currentDate])

   return (
      <div className="bg-white border-b border-[#E5E0D8] px-2.5 py-1.5 sm:px-4 sm:py-2 shrink-0 shadow-2xs">
         <div className="w-full max-w-[1600px] mx-auto flex flex-col gap-1.5 sm:gap-2">
            <div className="flex items-center justify-between gap-2">
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
                     >
                        <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                     </button>
                     <button
                        type="button"
                        onClick={onNextWeek}
                        className="p-1 rounded-md hover:bg-[#F5F2ED] text-[#8B857D] transition-colors"
                     >
                        <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                     </button>
                  </div>
                  <span className="hidden sm:inline text-xs sm:text-sm font-bold text-[#3E3A35] truncate ml-1">
                     {currentWeekLabel}
                  </span>
               </div>

               <div className="flex items-center gap-1.5 shrink-0">
                  {onMobileViewModeChange && (
                     <div className="flex sm:hidden items-center bg-[#F5F2ED] p-0.5 rounded-lg shrink-0">
                        <button
                           type="button"
                           onClick={() => onMobileViewModeChange('day')}
                           className={`p-1 rounded-md transition-all ${
                              mobileViewMode === 'day'
                                 ? 'bg-white text-[#3E3A35] shadow-xs'
                                 : 'text-[#8B857D] hover:text-[#3E3A35]'
                           }`}
                           title="Режим дня"
                           aria-label="Режим дня"
                        >
                           <Calendar className="w-3.5 h-3.5" />
                        </button>
                        <button
                           type="button"
                           onClick={() => onMobileViewModeChange('week')}
                           className={`p-1 rounded-md transition-all ${
                              mobileViewMode === 'week'
                                 ? 'bg-white text-[#3E3A35] shadow-xs'
                                 : 'text-[#8B857D] hover:text-[#3E3A35]'
                           }`}
                           title="Режим недели"
                           aria-label="Режим недели"
                        >
                           <CalendarDays className="w-3.5 h-3.5" />
                        </button>
                     </div>
                  )}

                  {isAdmin && (
                     <button
                        type="button"
                        onClick={onOpenCreate}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-[#8BA888] hover:bg-[#7A9A77] text-white rounded-lg shadow-xs transition-colors shrink-0"
                     >
                        <Plus className="w-3.5 h-3.5" />
                        <span className="hidden xs:inline">Занятие</span>
                     </button>
                  )}
               </div>
            </div>

            <div className="flex sm:hidden items-center justify-between px-0.5 text-xs leading-none">
               <span className="font-bold text-[#3E3A35]">{monthLabel}</span>
               <span className="text-[10px] font-medium text-[#8B857D]">
                  {currentWeekLabel}
               </span>
            </div>

            {mobileViewMode === 'day' && (
               <div className="flex sm:hidden items-center justify-between gap-1 overflow-x-auto custom-scrollbar pb-0.5">
                  {weekDates.map((day) => {
                     const isSelected =
                        day.dateObj.toDateString() ===
                        currentDate.toDateString()
                     return (
                        <button
                           key={day.key}
                           type="button"
                           onClick={() => onSelectDate(day.dateObj)}
                           className={`flex-1 min-w-[36px] py-1 px-0.5 rounded-lg flex flex-col items-center justify-center transition-all ${
                              isSelected
                                 ? 'bg-[#8BA888] text-white shadow-xs'
                                 : day.isToday
                                   ? 'bg-[#E8F0E8] text-[#3E3A35]'
                                   : 'bg-[#FAF8F5] text-[#5A534A] hover:bg-[#F0EDE8]'
                           }`}
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
            )}
         </div>
      </div>
   )
}
