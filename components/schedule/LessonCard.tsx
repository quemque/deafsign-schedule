'use client'

import { Clock, MessageSquare } from 'lucide-react'
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

const INDEX_TO_DAY = [
   'SUNDAY',
   'MONDAY',
   'TUESDAY',
   'WEDNESDAY',
   'THURSDAY',
   'FRIDAY',
   'SATURDAY',
]

interface LessonCardProps {
   lesson: ApiLesson
   dayDate: Date
   baseHour?: number
   startsAtDate?: Date
   endsAtDate?: Date
   column?: number
   totalColumns?: number
   onClick: () => void
}

function renderTeacherName(fullName: string) {
   const parts = fullName.trim().split(/\s+/)
   if (!parts[0]) return null

   const [lastName, ...rest] = parts

   return (
      <span className="truncate">
         <span className="text-red-500 font-bold">{lastName}</span>
         {rest.length > 0 ? ` ${rest.join(' ')}` : ''}
      </span>
   )
}

function getLessonIndex(lesson: ApiLesson, dayDate: Date): number | null {
   if (!lesson.isRecurring || !lesson.totalLessons) return null

   const startDate = new Date(lesson.startsAt)
   const currentTarget = new Date(dayDate)
   currentTarget.setHours(23, 59, 59, 999)

   if (currentTarget < startDate) return null

   const targetDays =
      lesson.daysOfWeek && lesson.daysOfWeek.length > 0
         ? lesson.daysOfWeek.map((d) => DAY_INDICES[d])
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
         const yyyy = cursor.getFullYear()
         const mm = String(cursor.getMonth() + 1).padStart(2, '0')
         const dd = String(cursor.getDate()).padStart(2, '0')
         const cursorKey = `${yyyy}-${mm}-${dd}`

         const isCancelled = lesson.cancellations?.some((c) => {
            const cDateStr =
               typeof c.date === 'string'
                  ? c.date.split('T')[0]
                  : new Date(c.date).toISOString().split('T')[0]
            return cDateStr === cursorKey
         })

         if (!isCancelled) {
            index++
         }
      }
      cursor.setDate(cursor.getDate() + 1)
   }

   return index <= lesson.totalLessons ? index : null
}

export function LessonCard({
   lesson,
   dayDate,
   baseHour = 8,
   startsAtDate,
   endsAtDate,
   column = 0,
   totalColumns = 1,
   onClick,
}: LessonCardProps) {
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

   const activeStartsAt = startsAtDate || new Date(lesson.startsAt)
   const activeEndsAt = endsAtDate || new Date(lesson.endsAt)

   const startMinutesFromBase =
      (activeStartsAt.getUTCHours() - baseHour) * 60 +
      activeStartsAt.getUTCMinutes()
   const durationMinutes =
      (activeEndsAt.getTime() - activeStartsAt.getTime()) / 60000

   if (startMinutesFromBase < 0) return null

   const topPx = (startMinutesFromBase / 60) * 96
   const heightPx = Math.max((durationMinutes / 60) * 96, 52)

   const widthPercent = 100 / totalColumns
   const leftPercent = column * widthPercent

   const formatTime = (d: Date) =>
      d.toLocaleTimeString('ru-RU', {
         timeZone: 'UTC',
         hour: '2-digit',
         minute: '2-digit',
      })

   const currentComment =
      lesson.comments?.find((c) => {
         const commentDateStr =
            typeof c.date === 'string' ? c.date : new Date(c.date).toISOString()
         return commentDateStr.startsWith(dateKey)
      })?.text || ''

   const dateOverride = lesson.overrides?.find((o) => {
      const oDateStr =
         typeof o.date === 'string' ? o.date : new Date(o.date).toISOString()
      return oDateStr.startsWith(dateKey)
   })

   const daySpecificTeacher = lesson.teacherByDay?.[dayKey]

   const teacherName =
      dateOverride !== undefined
         ? dateOverride.customTeacherName
         : daySpecificTeacher ||
           lesson.customTeacherName ||
           lesson.teacher?.name

   const baseColor = lesson.color || '#8BA888'
   const lessonIndex = getLessonIndex(lesson, dayDate)

   return (
      <div
         onClick={onClick}
         style={{
            top: `${topPx}px`,
            height: `${heightPx}px`,
            left: `calc(${leftPercent}% + 2px)`,
            width: `calc(${widthPercent}% - 4px)`,
            backgroundColor: `${baseColor}18`,
            borderColor: `${baseColor}80`,
         }}
         className="absolute rounded-xl p-1.5 sm:p-2 border transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md hover:scale-[1.01] active:scale-[0.99] flex flex-col overflow-hidden group text-[#3E3A35] z-10"
      >
         <div className="flex-1 min-h-0 flex flex-col">
            <div className="flex items-start justify-between gap-1 mb-0.5">
               <h3 className="text-[10px] sm:text-xs font-bold leading-tight line-clamp-1 break-words flex-1">
                  {lesson.subject}
               </h3>
               <span className="text-[8px] sm:text-[9px] font-medium opacity-80 flex items-center gap-0.5 shrink-0 whitespace-nowrap">
                  <Clock className="w-2.5 h-2.5" />
                  {formatTime(activeStartsAt)}
               </span>
            </div>

            <div className="text-[8px] sm:text-[9px] truncate leading-tight mb-0.5">
               {teacherName ? (
                  renderTeacherName(teacherName)
               ) : (
                  <span className="opacity-50 italic">Без преподавателя</span>
               )}
            </div>

            <div
               style={{ borderColor: `${baseColor}40` }}
               className="mt-auto pt-0.5 flex flex-col gap-0.5 border-t"
            >
               <div className="flex items-center justify-between text-[8px] sm:text-[9px]">
                  <div className="flex items-center gap-1">
                     {rescheduleSlot && (
                        <span className="text-[7px] sm:text-[8px] font-bold px-1 py-0.5 rounded-sm bg-amber-500 text-white shadow-2xs">
                           ПЕРЕНОС
                        </span>
                     )}
                     {lesson.isRecurring && (
                        <span className="text-[7px] sm:text-[8px] font-bold px-1 py-0.5 rounded-sm bg-white/70 shadow-2xs text-[#3E3A35]">
                           {lesson.totalLessons
                              ? `${lessonIndex ?? '–'}/${lesson.totalLessons}`
                              : 'ЦИКЛ'}
                        </span>
                     )}
                  </div>

                  {currentComment && (
                     <div className="flex items-center gap-0.5 text-[8px] sm:text-[9px] text-[#5A534A] opacity-70 italic ml-auto truncate max-w-[50%]">
                        <MessageSquare className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">{currentComment}</span>
                     </div>
                  )}
               </div>
            </div>
         </div>
      </div>
   )
}
