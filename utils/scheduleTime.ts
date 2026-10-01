import { isLessonActiveOnDate, getLessonRescheduleTarget } from '@/utils/date'
import type { ApiLesson } from '@/types/schedule'
import { WEEK_DAY_CONFIG, INDEX_TO_DAY } from '@/constants/schedule'

export interface DayItem {
   key: string
   label: string
   short: string
   dateObj: Date
   dateNumber: number
   isToday: boolean
}

export function formatDateKey(date: Date): string {
   const y = date.getFullYear()
   const m = String(date.getMonth() + 1).padStart(2, '0')
   const d = String(date.getDate()).padStart(2, '0')
   return `${y}-${m}-${d}`
}

export function getDayKeyByIndex(dayIndex: number): string {
   const configIndex = (dayIndex + 6) % 7
   return WEEK_DAY_CONFIG[configIndex]?.key || ''
}

export function getWeekDates(referenceDate: Date): DayItem[] {
   const d = new Date(referenceDate)
   const day = d.getDay()
   const diff = day === 0 ? -6 : 1 - day
   const monday = new Date(d)
   monday.setDate(d.getDate() + diff)
   monday.setHours(0, 0, 0, 0)

   const todayStr = new Date().toDateString()

   return WEEK_DAY_CONFIG.map((conf, index) => {
      const dateObj = new Date(monday)
      dateObj.setDate(monday.getDate() + index)
      return {
         key: conf.key,
         label: conf.label,
         short: conf.short,
         dateObj,
         dateNumber: dateObj.getDate(),
         isToday: dateObj.toDateString() === todayStr,
      }
   })
}

export function getWeekRangeParams(referenceDate: Date) {
   const week = getWeekDates(referenceDate)
   return {
      startDate: formatDateKey(week[0].dateObj),
      endDate: formatDateKey(week[6].dateObj),
   }
}

export function formatWeekLabel(date: Date): string {
   const d = new Date(date)
   const day = d.getDay()
   const diff = day === 0 ? -6 : 1 - day
   const monday = new Date(d)
   monday.setDate(d.getDate() + diff)
   const sunday = new Date(monday)
   sunday.setDate(monday.getDate() + 6)

   const monMonth = monday
      .toLocaleDateString('ru-RU', { month: 'short' })
      .replace('.', '')
   const sunMonth = sunday
      .toLocaleDateString('ru-RU', { month: 'short' })
      .replace('.', '')

   if (monday.getMonth() === sunday.getMonth()) {
      return `${monday.getDate()} – ${sunday.getDate()} ${sunMonth}`
   }
   return `${monday.getDate()} ${monMonth} – ${sunday.getDate()} ${sunMonth}`
}

export function isLessonOnDay(lesson: ApiLesson, day: DayItem): boolean {
   const dayDate = day.dateObj
   const dayIndex = dayDate.getDay()
   const dayEnumName = INDEX_TO_DAY[dayIndex]
   const dayKey = day.key

   const isRescheduled = Boolean(getLessonRescheduleTarget(lesson, dayDate))

   let matchesDay = false

   if (lesson.isRecurring) {
      const daysList = (lesson.daysOfWeek || []) as string[]
      const singleDay = lesson.dayOfWeek as string | null

      const matchesDaysList = daysList.some((d) => {
         const upper = String(d).toUpperCase()
         const lower = String(d).toLowerCase()
         return (
            upper === dayEnumName ||
            lower === dayKey.toLowerCase() ||
            upper === dayKey.toUpperCase()
         )
      })

      const matchesSingle = Boolean(
         singleDay &&
         (String(singleDay).toUpperCase() === dayEnumName ||
            String(singleDay).toLowerCase() === dayKey.toLowerCase() ||
            String(singleDay).toUpperCase() === dayKey.toUpperCase()),
      )

      matchesDay = Boolean(matchesDaysList || matchesSingle || isRescheduled)
   } else {
      const targetDateKey = formatDateKey(dayDate)

      const startsAtDate = new Date(lesson.startsAt)
      const startY = startsAtDate.getUTCFullYear()
      const startM = String(startsAtDate.getUTCMonth() + 1).padStart(2, '0')
      const startD = String(startsAtDate.getUTCDate()).padStart(2, '0')
      const lessonDateKeyUTC = `${startY}-${startM}-${startD}`

      const lessonDateKeyLocal = formatDateKey(startsAtDate)

      matchesDay =
         lessonDateKeyUTC === targetDateKey ||
         lessonDateKeyLocal === targetDateKey ||
         isRescheduled
   }

   return matchesDay && isLessonActiveOnDate(lesson, dayDate)
}

export function getLessonTimes(lesson: ApiLesson, dayDate: Date) {
   const dateKey = formatDateKey(dayDate)
   const dayIndex = dayDate.getDay()
   const dayEnum = INDEX_TO_DAY[dayIndex]
   const dayKey = getDayKeyByIndex(dayIndex)

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

   const customDayTime =
      lesson.timeByDay?.[dayEnum] ||
      lesson.timeByDay?.[dayKey] ||
      lesson.timeByDay?.[dayKey.toUpperCase()]

   if (
      lesson.isRecurring &&
      customDayTime?.startTime &&
      customDayTime?.endTime
   ) {
      const [sh, sm] = customDayTime.startTime.split(':').map(Number)
      const [eh, em] = customDayTime.endTime.split(':').map(Number)
      return {
         startsAt: new Date(
            Date.UTC(
               dayDate.getFullYear(),
               dayDate.getMonth(),
               dayDate.getDate(),
               sh,
               sm,
               0,
            ),
         ),
         endsAt: new Date(
            Date.UTC(
               dayDate.getFullYear(),
               dayDate.getMonth(),
               dayDate.getDate(),
               eh,
               em,
               0,
            ),
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
      visibleLessons.forEach((lesson) => {
         if (isLessonOnDay(lesson, day)) {
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
