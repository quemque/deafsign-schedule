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
