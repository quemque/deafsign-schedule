import { monthNames } from '@/constants/schedule'
import type { ApiLesson } from '@/types/schedule'

const DAY_INDICES: Record<string, number> = {
   SUNDAY: 0,
   MONDAY: 1,
   TUESDAY: 2,
   WEDNESDAY: 3,
   THURSDAY: 4,
   FRIDAY: 5,
   SATURDAY: 6,
}

export function getStartOfWeek(date: Date) {
   const d = new Date(date)
   const day = d.getDay()
   const diff = d.getDate() - day + (day === 0 ? -6 : 1)
   return new Date(d.setDate(diff))
}

export function getWeekLabel(startDate: Date, endDate: Date): string {
   const startMonth = monthNames[startDate.getMonth()]
   const endMonth = monthNames[endDate.getMonth()]

   if (startDate.getMonth() === endDate.getMonth()) {
      return `${startDate.getDate()} – ${endDate.getDate()} ${startMonth} ${startDate.getFullYear()}`
   }
   return `${startDate.getDate()} ${startMonth} – ${endDate.getDate()} ${endMonth} ${startDate.getFullYear()}`
}

export function isLessonCancelledOnDate(
   lesson: ApiLesson,
   dayDate: Date,
): boolean {
   if (!lesson.cancellations || lesson.cancellations.length === 0) return false

   const yyyy = dayDate.getFullYear()
   const mm = String(dayDate.getMonth() + 1).padStart(2, '0')
   const dd = String(dayDate.getDate()).padStart(2, '0')
   const dateKey = `${yyyy}-${mm}-${dd}`

   return lesson.cancellations.some((c) => {
      const cDateStr =
         typeof c.date === 'string'
            ? c.date.split('T')[0]
            : new Date(c.date).toISOString().split('T')[0]
      return cDateStr === dateKey
   })
}

export function getLessonRescheduleTarget(lesson: ApiLesson, dayDate: Date) {
   if (!lesson.reschedules || lesson.reschedules.length === 0) return null

   const yyyy = dayDate.getFullYear()
   const mm = String(dayDate.getMonth() + 1).padStart(2, '0')
   const dd = String(dayDate.getDate()).padStart(2, '0')
   const dateKey = `${yyyy}-${mm}-${dd}`

   return (
      lesson.reschedules.find((r) => {
         const rDateStr =
            typeof r.newStartsAt === 'string'
               ? r.newStartsAt.split('T')[0]
               : new Date(r.newStartsAt).toISOString().split('T')[0]
         return rDateStr === dateKey
      }) || null
   )
}

export function isLessonRescheduledAway(
   lesson: ApiLesson,
   dayDate: Date,
): boolean {
   if (!lesson.reschedules || lesson.reschedules.length === 0) return false

   const yyyy = dayDate.getFullYear()
   const mm = String(dayDate.getMonth() + 1).padStart(2, '0')
   const dd = String(dayDate.getDate()).padStart(2, '0')
   const dateKey = `${yyyy}-${mm}-${dd}`

   return lesson.reschedules.some((r) => {
      const rDateStr =
         typeof r.originalDate === 'string'
            ? r.originalDate.split('T')[0]
            : new Date(r.originalDate).toISOString().split('T')[0]
      return rDateStr === dateKey
   })
}

export function isLessonActiveOnDate(
   lesson: ApiLesson,
   checkDate: Date,
): boolean {
   if (isLessonCancelledOnDate(lesson, checkDate)) return false
   if (isLessonRescheduledAway(lesson, checkDate)) return false

   const rescheduledSlot = getLessonRescheduleTarget(lesson, checkDate)
   if (rescheduledSlot) return true

   if (lesson.endDate) {
      const checkMidnight = new Date(
         checkDate.getFullYear(),
         checkDate.getMonth(),
         checkDate.getDate(),
      ).getTime()
      const cutoff = new Date(lesson.endDate).setHours(23, 59, 59, 999)
      if (checkMidnight > cutoff) return false
   }

   const lessonStartDate = new Date(lesson.startsAt)
   const startDayMidnight = new Date(
      lessonStartDate.getUTCFullYear(),
      lessonStartDate.getUTCMonth(),
      lessonStartDate.getUTCDate(),
   ).getTime()

   const currentDayMidnight = new Date(
      checkDate.getFullYear(),
      checkDate.getMonth(),
      checkDate.getDate(),
   ).getTime()

   if (currentDayMidnight < startDayMidnight) return false

   if (!lesson.isRecurring || !lesson.totalLessons) return true

   const targetDays =
      lesson.daysOfWeek && lesson.daysOfWeek.length > 0
         ? lesson.daysOfWeek.map((d) => DAY_INDICES[d])
         : lesson.dayOfWeek
           ? [DAY_INDICES[lesson.dayOfWeek]]
           : [lessonStartDate.getUTCDay()]

   let count = 0
   const cursor = new Date(startDayMidnight)

   while (cursor.getTime() <= currentDayMidnight) {
      const dayOfWeekIndex = cursor.getDay()
      if (targetDays.includes(dayOfWeekIndex)) {
         const isCancelled = isLessonCancelledOnDate(lesson, cursor)
         if (!isCancelled) {
            count++
         }
      }
      cursor.setDate(cursor.getDate() + 1)
   }

   return count <= lesson.totalLessons
}

export function filterLessonsForWeek(
   lessons: ApiLesson[],
   startDate: Date,
   endDate: Date,
): ApiLesson[] {
   const startLocal = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate(),
   )
   const endLocal = new Date(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate(),
      23,
      59,
      59,
   )

   return lessons.filter((l) => {
      if (l.reschedules && l.reschedules.length > 0) {
         const hasRescheduleInWeek = l.reschedules.some((r) => {
            const rStart = new Date(r.newStartsAt)
            return rStart >= startLocal && rStart <= endLocal
         })
         if (hasRescheduleInWeek) return true
      }

      if (l.endDate) {
         const seriesEndDate = new Date(l.endDate)
         seriesEndDate.setUTCHours(23, 59, 59, 999)
         if (startLocal > seriesEndDate) return false
      }

      const lStart = new Date(l.startsAt)
      const lStartDay = new Date(
         lStart.getUTCFullYear(),
         lStart.getUTCMonth(),
         lStart.getUTCDate(),
      )

      if (lStartDay > endLocal) return false

      if (l.isRecurring) return true

      return lStartDay >= startLocal && lStartDay <= endLocal
   })
}
