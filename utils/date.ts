import { monthNames } from '@/constants/schedule'
import type { ApiLesson } from '@/types/schedule'

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
      if (l.endDate) {
         const seriesEndDate = new Date(l.endDate)
         seriesEndDate.setUTCHours(23, 59, 59, 999)
         if (startLocal > seriesEndDate) return false
      }

      if (l.isRecurring) return true

      const lDate = new Date(l.startsAt)
      const utcDate = new Date(
         lDate.getUTCFullYear(),
         lDate.getUTCMonth(),
         lDate.getUTCDate(),
         lDate.getUTCHours(),
         lDate.getUTCMinutes(),
      )
      return utcDate >= startLocal && utcDate <= endLocal
   })
}
