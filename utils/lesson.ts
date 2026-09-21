import { INDEX_TO_DAY, DAY_INDICES } from '@/constants/schedule'
import type { ApiLesson } from '@/types/schedule'

export interface LessonCardLayoutOptions {
   startsAt: Date
   endsAt: Date
   baseHour: number
   hourHeight: number
   column: number
   totalColumns: number
}

export interface LessonCardLayout {
   topPx: number
   heightPx: number
   leftPercent: number
   widthPercent: number
   isCompact: boolean
}

export function formatDateKey(date: Date): string {
   const yyyy = date.getFullYear()
   const mm = String(date.getMonth() + 1).padStart(2, '0')
   const dd = String(date.getDate()).padStart(2, '0')
   return `${yyyy}-${mm}-${dd}`
}

export function formatUtcTime(date: Date): string {
   return date.toLocaleTimeString('ru-RU', {
      timeZone: 'UTC',
      hour: '2-digit',
      minute: '2-digit',
   })
}

export function getRescheduleForDate(lesson: ApiLesson, dayDate: Date) {
   const dateKey = formatDateKey(dayDate)

   return lesson.reschedules?.find((reschedule) => {
      const targetDate =
         typeof reschedule.newStartsAt === 'string'
            ? reschedule.newStartsAt.split('T')[0]
            : new Date(reschedule.newStartsAt).toISOString().split('T')[0]

      return targetDate === dateKey
   })
}

export function resolveLessonTeacher(
   lesson: ApiLesson,
   dayDate: Date,
): string | undefined {
   const dateKey = formatDateKey(dayDate)
   const dayKey = INDEX_TO_DAY[dayDate.getDay()]

   const dateOverride = lesson.overrides?.find((override) => {
      const overrideDate =
         typeof override.date === 'string'
            ? override.date
            : new Date(override.date).toISOString()

      return overrideDate.startsWith(dateKey)
   })

   if (dateOverride?.customTeacherName !== undefined) {
      return dateOverride.customTeacherName ?? undefined
   }

   const daySpecificTeacher = lesson.teacherByDay?.[dayKey]
   if (daySpecificTeacher) {
      if (Array.isArray(daySpecificTeacher)) {
         const joined = daySpecificTeacher.filter(Boolean).join(', ')
         if (joined) return joined
      } else if (
         typeof daySpecificTeacher === 'string' &&
         daySpecificTeacher.trim()
      ) {
         return daySpecificTeacher
      }
   }

   const defaultTeacher = lesson.customTeacherName ?? lesson.teacher?.name
   return defaultTeacher ?? undefined
}

export function resolveLessonComment(lesson: ApiLesson, dayDate: Date): string {
   const dateKey = formatDateKey(dayDate)

   return (
      lesson.comments?.find((comment) => {
         const commentDate =
            typeof comment.date === 'string'
               ? comment.date
               : new Date(comment.date).toISOString()

         return commentDate.startsWith(dateKey)
      })?.text || ''
   )
}

export function getLessonIndex(
   lesson: ApiLesson,
   dayDate: Date,
): number | null {
   if (!lesson.isRecurring || !lesson.totalLessons) return null

   const startDate = new Date(lesson.startsAt)
   const currentTarget = new Date(dayDate)
   currentTarget.setHours(23, 59, 59, 999)

   if (currentTarget < startDate) return null

   const targetDays =
      lesson.daysOfWeek && lesson.daysOfWeek.length > 0
         ? lesson.daysOfWeek.map((day) => DAY_INDICES[day])
         : lesson.dayOfWeek
           ? [DAY_INDICES[lesson.dayOfWeek]]
           : [startDate.getUTCDay()]

   let index = 0
   const cursor = new Date(
      startDate.getUTCFullYear(),
      startDate.getUTCMonth(),
      startDate.getUTCDate(),
   )

   while (cursor <= currentTarget) {
      const dayOfWeekIndex = cursor.getDay()

      if (targetDays.includes(dayOfWeekIndex)) {
         const cursorKey = formatDateKey(cursor)

         const isCancelled = lesson.cancellations?.some((cancellation) => {
            const cancellationDate =
               typeof cancellation.date === 'string'
                  ? cancellation.date.split('T')[0]
                  : new Date(cancellation.date).toISOString().split('T')[0]

            return cancellationDate === cursorKey
         })

         if (!isCancelled) {
            index++
         }
      }

      cursor.setDate(cursor.getDate() + 1)
   }

   return index <= lesson.totalLessons ? index : null
}

export function calculateLessonCardLayout({
   startsAt,
   endsAt,
   baseHour,
   hourHeight,
   column,
   totalColumns,
}: LessonCardLayoutOptions): LessonCardLayout | null {
   const startMinutesFromBase =
      (startsAt.getUTCHours() - baseHour) * 60 + startsAt.getUTCMinutes()

   if (startMinutesFromBase < 0) return null

   const durationMinutes = (endsAt.getTime() - startsAt.getTime()) / 60000
   const topPx = (startMinutesFromBase / 60) * hourHeight
   const minHeight = hourHeight <= 50 ? 32 : 42
   const heightPx = Math.max((durationMinutes / 60) * hourHeight, minHeight)

   const widthPercent = 100 / totalColumns
   const leftPercent = column * widthPercent

   return {
      topPx,
      heightPx,
      leftPercent,
      widthPercent,
      isCompact: heightPx < 44,
   }
}
export function resolveLessonDisplayTimes(
   lesson: ApiLesson,
   displayDate: Date,
) {
   const yyyy = displayDate.getFullYear()
   const dayKey = INDEX_TO_DAY[displayDate.getDay()]
   const rescheduleSlot = getRescheduleForDate(lesson, displayDate)
   const customDayTime = lesson.timeByDay?.[dayKey]

   if (rescheduleSlot) {
      return {
         startsAt: rescheduleSlot.newStartsAt,
         endsAt: rescheduleSlot.newEndsAt,
         isRescheduled: true,
      }
   }

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
               yyyy,
               displayDate.getMonth(),
               displayDate.getDate(),
               sh,
               sm,
               0,
            ),
         ),
         endsAt: new Date(
            Date.UTC(
               yyyy,
               displayDate.getMonth(),
               displayDate.getDate(),
               eh,
               em,
               0,
            ),
         ),
         isRescheduled: false,
      }
   }

   return {
      startsAt: lesson.startsAt,
      endsAt: lesson.endsAt,
      isRescheduled: false,
   }
}
