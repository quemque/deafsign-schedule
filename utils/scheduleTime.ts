import { INDEX_TO_DAY } from '@/constants/schedule'
import { isLessonActiveOnDate, getLessonRescheduleTarget } from '@/utils/date'
import type { ApiLesson } from '@/types/schedule'

export interface DayItem {
   key: string
   label: string
   short: string
   dateObj: Date
   dateNumber: number
   isToday: boolean
}

export function getLessonTimes(lesson: ApiLesson, dayDate: Date) {
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

export function calculateScheduleTimeBounds(
   targetDays: DayItem[],
   visibleLessons: ApiLesson[],
) {
   let minMinutes = Infinity
   let maxMinutes = -Infinity

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
            const sMin = startsAt.getUTCHours() * 60 + startsAt.getUTCMinutes()
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

   const startHour = Math.max(0, Math.floor(minMinutes / 60))
   const endHour = Math.min(24, Math.ceil(maxMinutes / 60))

   const timeSlots: string[] = []
   for (let h = startHour; h < endHour; h++) {
      timeSlots.push(`${String(h).padStart(2, '0')}:00`)
   }

   return {
      startHour,
      endHour,
      timeSlots,
   }
}

export function calculateCurrentTimePosition(
   currentTime: Date,
   startHour: number,
   hourHeight: number,
) {
   const currentTotalMin =
      currentTime.getHours() * 60 + currentTime.getMinutes()
   const startTotalMin = startHour * 60
   return ((currentTotalMin - startTotalMin) / 60) * hourHeight
}
