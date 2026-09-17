'use client'

import { useState, useEffect, useMemo } from 'react'
import { Clock } from 'lucide-react'
import type { ApiLesson } from '@/types/schedule'
import { LessonCard } from './LessonCard'
import { isLessonActiveOnDate, getLessonRescheduleTarget } from '@/utils/date'
import { computeDayLayout } from '@/utils/layout'

const INDEX_TO_DAY = [
   'SUNDAY',
   'MONDAY',
   'TUESDAY',
   'WEDNESDAY',
   'THURSDAY',
   'FRIDAY',
   'SATURDAY',
]

interface DayItem {
   key: string
   label: string
   short: string
   dateObj: Date
   dateNumber: number
   isToday: boolean
}

interface ScheduleGridProps {
   weekDates: DayItem[]
   currentDate: Date
   currentTime: Date
   visibleLessons: ApiLesson[]
   mobileViewMode?: 'day' | 'week'
   onSelectDate: (date: Date) => void
   onSelectLesson: (lesson: ApiLesson, dayDate: Date) => void
}

function getLessonTimes(lesson: ApiLesson, dayDate: Date) {
   const yyyy = dayDate.getFullYear()
   const mm = String(dayDate.getMonth() + 1).padStart(2, '0')
   const dd = String(dayDate.getDate()).padStart(2, '0')
   const dateKey = `${yyyy}-${mm}-${dd}`
   const dayKey = INDEX_TO_DAY[dayDate.getDay()]

   const rescheduleSlot = lesson.reschedules?.find((r) => {
      const rDateStr =
         typeof r.newStartsAt === 'string'
            ? r.newStartsAt.split('T')[0]
            : new Date(r.newStartsAt).toISOString().split('T')[0]
      return rDateStr === dateKey
   })

   if (rescheduleSlot) {
      return {
         startsAt: new Date(rescheduleSlot.newStartsAt),
         endsAt: new Date(rescheduleSlot.newEndsAt),
      }
   }

   const customDayTime = lesson.timeByDay?.[dayKey]
   if (
      lesson.isRecurring &&
      customDayTime?.startTime &&
      customDayTime?.endTime
   ) {
      const [sh, sm] = customDayTime.startTime.split(':').map(Number)
      const [eh, em] = customDayTime.endTime.split(':').map(Number)
      return {
         startsAt: new Date(
            Date.UTC(yyyy, dayDate.getMonth(), dayDate.getDate(), sh, sm, 0),
         ),
         endsAt: new Date(
            Date.UTC(yyyy, dayDate.getMonth(), dayDate.getDate(), eh, em, 0),
         ),
      }
   }

   return {
      startsAt: new Date(lesson.startsAt),
      endsAt: new Date(lesson.endsAt),
   }
}

export function ScheduleGrid({
   weekDates,
   currentDate,
   currentTime,
   visibleLessons,
   mobileViewMode = 'day',
   onSelectDate,
   onSelectLesson,
}: ScheduleGridProps) {
   const [isMobile, setIsMobile] = useState(false)

   useEffect(() => {
      const checkMobile = () => {
         setIsMobile(window.innerWidth < 640)
      }
      checkMobile()
      window.addEventListener('resize', checkMobile)
      return () => window.removeEventListener('resize', checkMobile)
   }, [])

   const hourHeight = isMobile ? 44 : 56
   const isSingleDayMobile = isMobile && mobileViewMode === 'day'

   const { startHour, endHour, timeSlots } = useMemo(() => {
      let minMinutes = Infinity
      let maxMinutes = -Infinity

      const targetDays = isSingleDayMobile
         ? weekDates.filter(
              (day) =>
                 day.dateObj.toDateString() === currentDate.toDateString(),
           )
         : weekDates

      targetDays.forEach((day) => {
         const dayKeyDate = `${day.dateObj.getFullYear()}-${String(day.dateObj.getMonth() + 1).padStart(2, '0')}-${String(day.dateObj.getDate()).padStart(2, '0')}`

         visibleLessons.forEach((lesson) => {
            const isRescheduledToThisDay = Boolean(
               getLessonRescheduleTarget(lesson, day.dateObj),
            )

            const matchesDay = lesson.isRecurring
               ? (lesson.daysOfWeek && lesson.daysOfWeek.length > 0
                    ? lesson.daysOfWeek.includes(day.key)
                    : lesson.dayOfWeek === day.key) || isRescheduledToThisDay
               : new Date(lesson.startsAt).toISOString().split('T')[0] ===
                    dayKeyDate || isRescheduledToThisDay

            if (matchesDay && isLessonActiveOnDate(lesson, day.dateObj)) {
               const { startsAt, endsAt } = getLessonTimes(lesson, day.dateObj)
               const sMin =
                  startsAt.getUTCHours() * 60 + startsAt.getUTCMinutes()
               const eMin = endsAt.getUTCHours() * 60 + endsAt.getUTCMinutes()

               if (sMin < minMinutes) minMinutes = sMin
               if (eMin > maxMinutes) maxMinutes = eMin
            }
         })
      })

      if (minMinutes === Infinity || maxMinutes === -Infinity) {
         minMinutes = 8 * 60
         maxMinutes = 20 * 60
      }

      const sHour = Math.max(0, Math.floor(minMinutes / 60))
      const eHour = Math.min(24, Math.ceil(maxMinutes / 60))

      const slots: string[] = []
      for (let h = sHour; h < eHour; h++) {
         slots.push(`${String(h).padStart(2, '0')}:00`)
      }

      return {
         startHour: sHour,
         endHour: eHour,
         timeSlots: slots,
      }
   }, [weekDates, visibleLessons, isSingleDayMobile, currentDate])

   const totalHours = Math.max(1, endHour - startHour)
   const totalHeightPx = totalHours * hourHeight

   const getCurrentTimePosition = () => {
      const hours = currentTime.getHours()
      const minutes = currentTime.getMinutes()
      const currentTotalMin = hours * 60 + minutes
      const startTotalMin = startHour * 60
      return ((currentTotalMin - startTotalMin) / 60) * hourHeight
   }

   const gridColsClass =
      mobileViewMode === 'week'
         ? 'grid-cols-[36px_repeat(7,minmax(95px,1fr))] sm:grid-cols-[48px_repeat(7,1fr)]'
         : 'grid-cols-[36px_1fr] sm:grid-cols-[48px_repeat(7,1fr)]'

   const containerWidthClass =
      mobileViewMode === 'week' ? 'min-w-[700px] sm:min-w-full' : 'min-w-full'

   return (
      <div className="flex-1 bg-white rounded-xl border border-[#E5E0D8] shadow-2xs flex flex-col overflow-hidden">
         <div className="flex-1 overflow-auto w-full relative custom-scrollbar bg-white">
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
                     return (
                        <div
                           key={day.key}
                           onClick={() => onSelectDate(day.dateObj)}
                           className={`py-1 sm:py-1.5 px-0.5 sm:px-1 border-r border-[#E5E0D8] last:border-r-0 flex-col items-center justify-center cursor-pointer transition-colors ${
                              isSelected || mobileViewMode === 'week'
                                 ? 'flex'
                                 : 'hidden sm:flex'
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

                  {weekDates.map((day) => {
                     const isSelected =
                        day.dateObj.toDateString() ===
                        currentDate.toDateString()

                     const dayKeyDate = `${day.dateObj.getFullYear()}-${String(day.dateObj.getMonth() + 1).padStart(2, '0')}-${String(day.dateObj.getDate()).padStart(2, '0')}`

                     const rawDayLessons = visibleLessons.filter((l) => {
                        const isRescheduledToThisDay = Boolean(
                           getLessonRescheduleTarget(l, day.dateObj),
                        )

                        const matchesDay = l.isRecurring
                           ? (l.daysOfWeek && l.daysOfWeek.length > 0
                                ? l.daysOfWeek.includes(day.key)
                                : l.dayOfWeek === day.key) ||
                             isRescheduledToThisDay
                           : new Date(l.startsAt)
                                .toISOString()
                                .split('T')[0] === dayKeyDate ||
                             isRescheduledToThisDay

                        if (!matchesDay) return false
                        return isLessonActiveOnDate(l, day.dateObj)
                     })

                     const layoutLessons = computeDayLayout(
                        rawDayLessons,
                        day.dateObj,
                     )

                     const nowPos = getCurrentTimePosition()
                     const isNowVisible = nowPos >= 0 && nowPos <= totalHeightPx

                     return (
                        <div
                           key={day.key}
                           className={`relative border-r border-[#F0EDE8] last:border-r-0 ${
                              isSelected || mobileViewMode === 'week'
                                 ? 'block'
                                 : 'hidden sm:block'
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
                              <div
                                 className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
                                 style={{ top: `${nowPos}px` }}
                              >
                                 <div className="w-1.5 h-1.5 rounded-full bg-[#8BA888] -ml-[3px] ring-2 ring-[#8BA888]/20" />
                                 <div className="flex-1 h-[1.5px] bg-[#8BA888]/70" />
                              </div>
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
                                 onClick={() =>
                                    onSelectLesson(item.lesson, day.dateObj)
                                 }
                              />
                           ))}
                        </div>
                     )
                  })}
               </div>
            </div>
         </div>
      </div>
   )
}
