'use client'

import {
   ChevronLeft,
   ChevronRight,
   Plus,
   CalendarDays,
   Calendar,
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
   return (
      <div className="bg-white border-b border-[#E5E0D8] px-3 py-2.5 sm:px-6 sm:py-3.5 shrink-0 shadow-2xs">
         <div className="max-w-7xl mx-auto flex flex-col gap-2.5">
            <div className="flex items-center justify-between gap-2">
               <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <button
                     type="button"
                     onClick={onSetToday}
                     className="px-2.5 py-1 text-xs font-semibold bg-[#F5F2ED] hover:bg-[#EDE8E0] text-[#3E3A35] rounded-xl transition-colors shrink-0"
                  >
                     Сегодня
                  </button>
                  <div className="flex items-center gap-0.5 shrink-0">
                     <button
                        type="button"
                        onClick={onPrevWeek}
                        className="p-1 rounded-lg hover:bg-[#F5F2ED] text-[#8B857D] transition-colors"
                     >
                        <ChevronLeft className="w-4 h-4" />
                     </button>
                     <button
                        type="button"
                        onClick={onNextWeek}
                        className="p-1 rounded-lg hover:bg-[#F5F2ED] text-[#8B857D] transition-colors"
                     >
                        <ChevronRight className="w-4 h-4" />
                     </button>
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-[#3E3A35] truncate ml-1">
                     {currentWeekLabel}
                  </span>
               </div>

               <div className="flex items-center gap-1.5 shrink-0">
                  {onMobileViewModeChange && (
                     <div className="flex sm:hidden items-center bg-[#F5F2ED] p-0.5 rounded-xl">
                        <button
                           type="button"
                           onClick={() => onMobileViewModeChange('day')}
                           className={`flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                              mobileViewMode === 'day'
                                 ? 'bg-white text-[#3E3A35] shadow-xs'
                                 : 'text-[#8B857D] hover:text-[#3E3A35]'
                           }`}
                        >
                           <Calendar className="w-3 h-3" />
                           <span>День</span>
                        </button>
                        <button
                           type="button"
                           onClick={() => onMobileViewModeChange('week')}
                           className={`flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                              mobileViewMode === 'week'
                                 ? 'bg-white text-[#3E3A35] shadow-xs'
                                 : 'text-[#8B857D] hover:text-[#3E3A35]'
                           }`}
                        >
                           <CalendarDays className="w-3 h-3" />
                           <span>Неделя</span>
                        </button>
                     </div>
                  )}

                  {isAdmin && (
                     <button
                        type="button"
                        onClick={onOpenCreate}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-[#8BA888] hover:bg-[#7A9A77] text-white rounded-xl shadow-xs transition-colors shrink-0"
                     >
                        <Plus className="w-4 h-4" />
                        <span className="hidden xs:inline">Занятие</span>
                     </button>
                  )}
               </div>
            </div>

            {mobileViewMode === 'day' && (
               <div className="flex sm:hidden items-center justify-between gap-1 overflow-x-auto custom-scrollbar pb-1">
                  {weekDates.map((day) => {
                     const isSelected =
                        day.dateObj.toDateString() ===
                        currentDate.toDateString()
                     return (
                        <button
                           key={day.key}
                           type="button"
                           onClick={() => onSelectDate(day.dateObj)}
                           className={`flex-1 min-w-[40px] py-1.5 px-1 rounded-xl flex flex-col items-center justify-center transition-all ${
                              isSelected
                                 ? 'bg-[#8BA888] text-white shadow-xs'
                                 : day.isToday
                                   ? 'bg-[#E8F0E8] text-[#3E3A35]'
                                   : 'bg-[#FAF8F5] text-[#5A534A] hover:bg-[#F0EDE8]'
                           }`}
                        >
                           <span className="text-[10px] font-medium opacity-80 uppercase leading-none">
                              {day.short}
                           </span>
                           <span className="text-xs font-bold mt-1 leading-none">
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
