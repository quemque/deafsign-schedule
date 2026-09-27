import { DAYS_OF_WEEK } from '@/constants/schedule'
import type { DayItem } from '@/utils/scheduleTime'
import { monthNames } from '@/constants/schedule'

export function computeWeekDates(referenceDate: Date): DayItem[] {
   const date = new Date(referenceDate)
   const currentDayIndex = date.getDay()
   const distanceToMonday = currentDayIndex === 0 ? -6 : 1 - currentDayIndex

   const monday = new Date(date)
   monday.setDate(date.getDate() + distanceToMonday)
   monday.setHours(0, 0, 0, 0)

   const today = new Date()
   const todayStr = today.toDateString()

   return Array.from({ length: 7 }, (_, index) => {
      const dayDate = new Date(monday)
      dayDate.setDate(monday.getDate() + index)

      const dayConfig = DAYS_OF_WEEK[index]

      return {
         dateObj: dayDate,
         key: dayConfig.key,
         label: dayConfig.label,
         short: dayConfig.short,
         dateNumber: dayDate.getDate(),
         isToday: dayDate.toDateString() === todayStr,
      }
   })
}

export function formatWeekLabel(weekDates: DayItem[]): string {
   if (weekDates.length === 0) return ''

   const firstDay = weekDates[0].dateObj
   const lastDay = weekDates[weekDates.length - 1].dateObj

   const startDay = firstDay.getDate()
   const endDay = lastDay.getDate()
   const startMonth = monthNames[firstDay.getMonth()]
   const endMonth = monthNames[lastDay.getMonth()]
   const year = lastDay.getFullYear()

   if (firstDay.getMonth() === lastDay.getMonth()) {
      return `${startDay} – ${endDay} ${startMonth} ${year}`
   }

   return `${startDay} ${startMonth} – ${endDay} ${endMonth} ${year}`
}
