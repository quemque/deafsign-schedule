'use client'

import { useMemo, useRef } from 'react'
import { Clock } from 'lucide-react'
import type { ApiLesson } from '@/types/schedule'
import { LessonCard } from './LessonCard'
import { computeDayLayout } from '@/utils/layout'
import { getLessonRescheduleTarget, isLessonActiveOnDate } from '@/utils/date'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useScheduleSwipe } from '@/hooks/useScheduleSwipe'
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation'
import {
   DayItem,
   calculateScheduleTimeBounds,
   calculateCurrentTimePosition,
} from '@/utils/scheduleTime'

interface ScheduleGridProps {
   weekDates: DayItem[]
   currentDate: Date
   currentTime: Date
   visibleLessons: ApiLesson[]
   mobileViewMode?: 'day' | 'week'
   isModalOpen?: boolean
   onSelectDate: (date: Date) => void
   onSelectLesson: (lesson: ApiLesson, dayDate: Date) => void
   onPrevDay?: () => void
   onNextDay?: () => void
   onPrevWeek: () => void
   onNextWeek: () => void
}

interface CurrentTimeIndicatorProps {
   position: number
}

interface TimeGutterProps {
   timeSlots: string[]
   hourHeight: number
}

interface DayColumnProps {
   day: DayItem
   isVisible: boolean
   timeSlots: string[]
   hourHeight: number
   startHour: number
   nowPosition: number
   visibleLessons: ApiLesson[]
   onSelectLesson: (lesson: ApiLesson, dayDate: Date) => void
}

function CurrentTimeIndicator({ position }: CurrentTimeIndicatorProps) {
   return (
      <div
         className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
         style={{ top: `${position}px` }}
      >
         <div className="w-1.5 h-1.5 rounded-full bg-[#8BA888] -ml-[3px] ring-2 ring-[#8BA888]/20" />
         <div className="flex-1 h-[1.5px] bg-[#8BA888]/70" />
      </div>
   )
}

function TimeGutter({ timeSlots, hourHeight }: TimeGutterProps) {
   return (
      <div className="bg-[#FDFCFB] flex flex-col text-right select-none sticky left-0 z-30 border-r border-[#E5E0D8]">
         {timeSlots.map((time) => (
            <div
               key={time}
               style={{ height: `${hourHeight}px` }}
               className="border-b border-[#F0EDE8] text-[8px] sm:text-[10px] text-[#B0A89E] font-medium pt-0.5 pr-1 sm:pr-1.5 bg-[#FDFCFB]"
            >
               {time}
            </div>
         ))}
      </div>
   )
}

function DayColumn({
   day,
   isVisible,
   timeSlots,
   hourHeight,
   startHour,
   nowPosition,
   visibleLessons,
   onSelectLesson,
}: DayColumnProps) {
   const totalHeight = timeSlots.length * hourHeight
   const isNowVisible = nowPosition >= 0 && nowPosition <= totalHeight

   const layoutLessons = useMemo(() => {
      const dayKeyDate = `${day.dateObj.getFullYear()}-${String(day.dateObj.getMonth() + 1).padStart(2, '0')}-${String(day.dateObj.getDate()).padStart(2, '0')}`

      const rawDayLessons = visibleLessons.filter((lesson) => {
         const isRescheduled = Boolean(
            getLessonRescheduleTarget(lesson, day.dateObj),
         )

         const matchesDay = lesson.isRecurring
            ? (lesson.daysOfWeek && lesson.daysOfWeek.length > 0
                 ? lesson.daysOfWeek.includes(day.key)
                 : lesson.dayOfWeek === day.key) || isRescheduled
            : new Date(lesson.startsAt).toISOString().split('T')[0] ===
                 dayKeyDate || isRescheduled

         return matchesDay && isLessonActiveOnDate(lesson, day.dateObj)
      })

      return computeDayLayout(rawDayLessons, day.dateObj)
   }, [day, visibleLessons])

   return (
      <div
         className={`relative border-r border-[#F0EDE8] last:border-r-0 ${
            isVisible ? 'block' : 'hidden sm:block'
         } ${day.isToday ? 'bg-[#E8F0E8]/10' : 'bg-white'}`}
      >
         {timeSlots.map((time) => (
            <div
               key={time}
               style={{ height: `${hourHeight}px` }}
               className="border-b border-[#F0EDE8]/80 w-full"
            />
         ))}

         {day.isToday && isNowVisible && (
            <CurrentTimeIndicator position={nowPosition} />
         )}

         {layoutLessons.map((item) => (
            <LessonCard
               key={item.lesson.id}
               lesson={item.lesson}
               dayDate={day.dateObj}
               baseHour={startHour}
               hourHeight={hourHeight}
               startsAtDate={item.startsAt}
               endsAtDate={item.endsAt}
               column={item.column}
               totalColumns={item.totalColumns}
               onClick={() => onSelectLesson(item.lesson, day.dateObj)}
            />
         ))}
      </div>
   )
}

export function ScheduleGrid({
   weekDates,
   currentDate,
   currentTime,
   visibleLessons,
   mobileViewMode = 'day',
   isModalOpen = false,
   onSelectDate,
   onSelectLesson,
   onPrevDay,
   onNextDay,
   onPrevWeek,
   onNextWeek,
}: ScheduleGridProps) {
   const isMobile = useIsMobile()
   const scrollContainerRef = useRef<HTMLDivElement | null>(null)

   const handlePrev = () => {
      if (onPrevDay) return onPrevDay()
      const prev = new Date(currentDate)
      prev.setDate(prev.getDate() - 1)
      onSelectDate(prev)
   }

   const handleNext = () => {
      if (onNextDay) return onNextDay()
      const next = new Date(currentDate)
      next.setDate(next.getDate() + 1)
      onSelectDate(next)
   }

   const isDayMode = isMobile && mobileViewMode === 'day'

   useKeyboardNavigation({
      enabled: !isModalOpen,
      onPrev: isDayMode ? handlePrev : onPrevWeek,
      onNext: isDayMode ? handleNext : onNextWeek,
   })

   const { handleTouchStart, handleTouchEnd, handleTouchCancel } =
      useScheduleSwipe({
         containerRef: scrollContainerRef,
         isMobile,
         isDayMode,
         onPrevDay: handlePrev,
         onNextDay: handleNext,
         onPrevWeek,
         onNextWeek,
      })

   const hourHeight = isMobile ? 44 : 56

   const targetDays = useMemo(() => {
      if (!isDayMode) return weekDates
      return weekDates.filter(
         (d) => d.dateObj.toDateString() === currentDate.toDateString(),
      )
   }, [isDayMode, weekDates, currentDate])

   const { startHour, endHour, timeSlots } = useMemo(
      () => calculateScheduleTimeBounds(targetDays, visibleLessons),
      [targetDays, visibleLessons],
   )

   const totalHeightPx = (endHour - startHour) * hourHeight
   const nowPosition = calculateCurrentTimePosition(
      currentTime,
      startHour,
      hourHeight,
   )

   const gridColsClass =
      mobileViewMode === 'week'
         ? 'grid-cols-[36px_repeat(7,minmax(95px,1fr))] sm:grid-cols-[48px_repeat(7,1fr)]'
         : 'grid-cols-[36px_1fr] sm:grid-cols-[48px_repeat(7,1fr)]'

   const containerWidthClass =
      mobileViewMode === 'week' ? 'min-w-[700px] sm:min-w-full' : 'min-w-full'

   return (
      <div
         onTouchStart={handleTouchStart}
         onTouchEnd={handleTouchEnd}
         onTouchCancel={handleTouchCancel}
         className="flex-1 bg-white rounded-xl border border-[#E5E0D8] shadow-2xs flex flex-col overflow-hidden select-none"
      >
         <div
            ref={scrollContainerRef}
            className={`flex-1 overflow-auto w-full relative custom-scrollbar bg-white ${
               isDayMode ? 'touch-pan-y' : ''
            }`}
         >
            <div className={`${containerWidthClass} relative`}>
               <div
                  className={`grid ${gridColsClass} sticky top-0 z-40 bg-[#FDFCFB]/95 backdrop-blur-md border-b border-[#E5E0D8] shadow-[0_1px_2px_rgba(0,0,0,0.03)]`}
               >
                  <div className="border-r border-[#E5E0D8] sticky left-0 z-50 bg-[#FDFCFB]/95 backdrop-blur-md flex flex-col items-center justify-center py-1 sm:py-1.5 text-[8px] sm:text-[10px] font-semibold text-[#B0A89E] uppercase tracking-wider">
                     <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 mb-0.5 opacity-60" />
                     Время
                  </div>

                  {weekDates.map((day) => {
                     const isSelected =
                        day.dateObj.toDateString() ===
                        currentDate.toDateString()
                     const isVisible = isSelected || mobileViewMode === 'week'

                     return (
                        <div
                           key={day.key}
                           onClick={() => onSelectDate(day.dateObj)}
                           className={`py-1 sm:py-1.5 px-0.5 sm:px-1 border-r border-[#E5E0D8] last:border-r-0 flex-col items-center justify-center cursor-pointer transition-colors ${
                              isVisible ? 'flex' : 'hidden sm:flex'
                           } ${day.isToday ? 'bg-[#E8F0E8]/60' : 'hover:bg-[#F5F2ED]/40'}`}
                        >
                           <span className="text-[9px] sm:text-[11px] font-medium text-[#8B857D] leading-none">
                              {day.label}
                           </span>
                           <div
                              className={`mt-0.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-bold ${
                                 day.isToday
                                    ? 'bg-[#8BA888] text-white shadow-2xs'
                                    : 'text-[#3E3A35] bg-white border border-[#E5E0D8]'
                              }`}
                           >
                              {day.dateNumber}
                           </div>
                        </div>
                     )
                  })}
               </div>

               <div
                  className={`grid ${gridColsClass} relative`}
                  style={{ minHeight: `${totalHeightPx}px` }}
               >
                  <TimeGutter timeSlots={timeSlots} hourHeight={hourHeight} />

                  {weekDates.map((day) => {
                     const isSelected =
                        day.dateObj.toDateString() ===
                        currentDate.toDateString()
                     const isVisible = isSelected || mobileViewMode === 'week'

                     return (
                        <DayColumn
                           key={day.key}
                           day={day}
                           isVisible={isVisible}
                           timeSlots={timeSlots}
                           hourHeight={hourHeight}
                           startHour={startHour}
                           nowPosition={nowPosition}
                           visibleLessons={visibleLessons}
                           onSelectLesson={onSelectLesson}
                        />
                     )
                  })}
               </div>
            </div>
         </div>
      </div>
   )
}
