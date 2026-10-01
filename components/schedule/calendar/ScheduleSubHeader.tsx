'use client'

import { Plus } from 'lucide-react'
import { useScheduleStore } from '@/stores/useScheduleStore'
import { useModalStore } from '@/stores/useModalStore'
import type { DayItem } from '@/utils/scheduleTime'
import { WeekNavigation } from './WeekNavigation'
import { MobileViewToggle } from './MobileViewToggle'
import { MobileDayPicker } from './MobileDayPicker'

interface ScheduleSubHeaderProps {
   currentWeekLabel: string
   weekDates: DayItem[]
   isAdmin: boolean
}

function formatMonthYear(date: Date): string {
   const formatted = date.toLocaleDateString('ru-RU', {
      month: 'long',
      year: 'numeric',
   })
   const cleaned = formatted.replace(/\s*г\.?$/, '')
   return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
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
                     <button
                        type="button"
                        onClick={() => openCreateForm(currentDate)}
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
