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
            />
         ))}
      </div>
   )
}
