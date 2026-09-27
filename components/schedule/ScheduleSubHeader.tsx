'use client'

import {
   ChevronLeft,
   ChevronRight,
   Plus,
   Calendar,
   CalendarDays,
} from 'lucide-react'
import { useScheduleStore } from '@/stores/useScheduleStore'
import { useModalStore } from '@/stores/useModalStore'
import type { DayItem } from '@/utils/scheduleTime'

interface ScheduleSubHeaderProps {
   currentWeekLabel: string
   weekDates: DayItem[]
   isAdmin: boolean
}

interface WeekNavigationProps {
   currentWeekLabel: string
   onSetToday: () => void
   onPrevWeek: () => void
   onNextWeek: () => void
}

interface MobileViewToggleProps {
   mode: 'day' | 'week'
   onChange: (mode: 'day' | 'week') => void
}

interface MobileDayPickerProps {
   weekDates: DayItem[]
   currentDate: Date
   onSelectDate: (date: Date) => void
}

interface CreateLessonButtonProps {
   onClick: () => void
}

function formatMonthYear(date: Date): string {
   const formatted = date.toLocaleDateString('ru-RU', {
      month: 'long',
      year: 'numeric',
   })
   const cleaned = formatted.replace(/\s*г\.?$/, '')
   return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
}

function getDayButtonClassName(isSelected: boolean, isToday: boolean): string {
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

function getViewModeButtonClassName(isActive: boolean): string {
   return `p-1 rounded-md transition-all ${
      isActive
         ? 'bg-white text-[#3E3A35] shadow-xs'
         : 'text-[#8B857D] hover:text-[#3E3A35]'
   }`
}

function WeekNavigation({
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

function MobileViewToggle({ mode, onChange }: MobileViewToggleProps) {
   return (
      <div className="flex sm:hidden items-center bg-[#F5F2ED] p-0.5 rounded-lg shrink-0">
         <button
            type="button"
            onClick={() => onChange('day')}
            className={getViewModeButtonClassName(mode === 'day')}
            title="Режим дня"
            aria-label="Режим дня"
         >
            <Calendar className="w-3.5 h-3.5" />
         </button>
         <button
            type="button"
            onClick={() => onChange('week')}
            className={getViewModeButtonClassName(mode === 'week')}
            title="Режим недели"
            aria-label="Режим недели"
         >
            <CalendarDays className="w-3.5 h-3.5" />
         </button>
      </div>
   )
}

function CreateLessonButton({ onClick }: CreateLessonButtonProps) {
   return (
      <button
         type="button"
         onClick={onClick}
         className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-[#8BA888] hover:bg-[#7A9A77] text-white rounded-lg shadow-xs transition-colors shrink-0"
      >
         <Plus className="w-3.5 h-3.5" />
         <span className="hidden xs:inline">Занятие</span>
      </button>
   )
}

function MobileDayPicker({
   weekDates,
   currentDate,
   onSelectDate,
}: MobileDayPickerProps) {
   const currentDayTimestamp = currentDate.toDateString()

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

export function ScheduleSubHeader({
   currentWeekLabel,
   weekDates,
   isAdmin,
}: ScheduleSubHeaderProps) {
   const currentDate = useScheduleStore((state) => state.currentDate)
   const mobileViewMode = useScheduleStore((state) => state.mobileViewMode)
   const setMobileViewMode = useScheduleStore(
      (state) => state.setMobileViewMode,
   )
   const prevWeek = useScheduleStore((state) => state.prevWeek)
   const nextWeek = useScheduleStore((state) => state.nextWeek)
   const setToday = useScheduleStore((state) => state.setToday)
   const setCurrentDate = useScheduleStore((state) => state.setCurrentDate)

   const openCreateForm = useModalStore((state) => state.openCreateForm)

   const monthLabel = formatMonthYear(currentDate)

   return (
      <div className="bg-white border-b border-[#E5E0D8] px-2.5 py-1.5 sm:px-4 sm:py-2 shrink-0 shadow-2xs">
         <div className="w-full max-w-[1600px] mx-auto flex flex-col gap-1.5 sm:gap-2">
            <div className="flex items-center justify-between gap-2">
               <WeekNavigation
                  currentWeekLabel={currentWeekLabel}
                  onSetToday={setToday}
                  onPrevWeek={prevWeek}
                  onNextWeek={nextWeek}
               />

               <div className="flex items-center gap-1.5 shrink-0">
                  <MobileViewToggle
                     mode={mobileViewMode}
                     onChange={setMobileViewMode}
                  />

                  {isAdmin && (
                     <CreateLessonButton
                        onClick={() => openCreateForm(currentDate)}
                     />
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
               <MobileDayPicker
                  weekDates={weekDates}
                  currentDate={currentDate}
                  onSelectDate={setCurrentDate}
               />
            )}
         </div>
      </div>
   )
}
