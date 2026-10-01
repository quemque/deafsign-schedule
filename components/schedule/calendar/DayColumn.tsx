'use client'

import { useMemo } from 'react'
import type { ApiLesson } from '@/types/schedule'
import type { DayItem } from '@/utils/scheduleTime'
import { computeDayLayout } from '@/utils/layout'
import { getLessonRescheduleTarget, isLessonActiveOnDate } from '@/utils/date'
import { LessonCard } from './LessonCard'
import { CurrentTimeIndicator } from './CurrentTimeIndicator'

interface DayColumnProps {
   day: DayItem
   isVisible: boolean
   timeSlots: string[]
   hourHeight: number
   startHour: number
   nowPosition: number
   visibleLessons: ApiLesson[]
}

const DAY_INDEX_TO_ENUM = [
   'SUNDAY',
   'MONDAY',
   'TUESDAY',
   'WEDNESDAY',
   'THURSDAY',
   'FRIDAY',
   'SATURDAY',
]

const DAY_INDEX_TO_SHORT = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

export function DayColumn({
   day,
   isVisible,
   timeSlots,
   hourHeight,
   startHour,
   nowPosition,
   visibleLessons,
}: DayColumnProps) {
   const totalHeight = timeSlots.length * hourHeight
   const isNowVisible = nowPosition >= 0 && nowPosition <= totalHeight

   const layoutLessons = useMemo(() => {
      const dayDate = day.dateObj
      const dayIndex = dayDate.getDay()
      const dayEnumName = DAY_INDEX_TO_ENUM[dayIndex]
      const dayShortName = DAY_INDEX_TO_SHORT[dayIndex]

      const yyyy = dayDate.getFullYear()
      const mm = String(dayDate.getMonth() + 1).padStart(2, '0')
      const dd = String(dayDate.getDate()).padStart(2, '0')
      const targetDateKey = `${yyyy}-${mm}-${dd}`

      const rawDayLessons = visibleLessons.filter((lesson) => {
         const isRescheduled = Boolean(
            getLessonRescheduleTarget(lesson, dayDate),
         )

         let matchesDay = false

         if (lesson.isRecurring) {
            const daysList = (lesson.daysOfWeek || []) as string[]
            const singleDay = lesson.dayOfWeek as string | null

            const matchesDaysList = daysList.some((d) => {
               const upper = String(d).toUpperCase()
               const lower = String(d).toLowerCase()
               return (
                  upper === dayEnumName ||
                  lower === dayShortName ||
                  lower === day.key.toLowerCase()
               )
            })

            const matchesSingle =
               singleDay &&
               (String(singleDay).toUpperCase() === dayEnumName ||
                  String(singleDay).toLowerCase() === dayShortName ||
                  String(singleDay).toLowerCase() === day.key.toLowerCase())

            matchesDay = Boolean(
               matchesDaysList || matchesSingle || isRescheduled,
            )
         } else {
            const lessonDateKey = new Date(lesson.startsAt)
               .toISOString()
               .split('T')[0]
            matchesDay = lessonDateKey === targetDateKey || isRescheduled
         }

         return matchesDay && isLessonActiveOnDate(lesson, dayDate)
      })

      return computeDayLayout(rawDayLessons, dayDate)
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
            />
         ))}
      </div>
   )
}
