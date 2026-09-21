'use client'

import { Clock, MessageSquare } from 'lucide-react'
import type { ApiLesson } from '@/types/schedule'
import {
   calculateLessonCardLayout,
   formatUtcTime,
   getLessonIndex,
   getRescheduleForDate,
   resolveLessonComment,
   resolveLessonTeacher,
} from '@/utils/lesson'
import { TeacherName } from './TeacherName'

interface LessonCardProps {
   lesson: ApiLesson
   dayDate: Date
   baseHour?: number
   hourHeight?: number
   startsAtDate?: Date
   endsAtDate?: Date
   column?: number
   totalColumns?: number
   onClick: () => void
}

interface LessonBadgesProps {
   isRescheduled: boolean
   isRecurring: boolean
   lessonIndex: number | null
   totalLessons?: number | null
   isCompact: boolean
}

interface LessonCommentProps {
   text: string
   isCompact: boolean
}

function LessonBadges({
   isRescheduled,
   isRecurring,
   lessonIndex,
   totalLessons,
   isCompact,
}: LessonBadgesProps) {
   const rescheduleLabel = isCompact ? 'П' : 'ПЕРЕНОС'
   const recurringLabel = totalLessons
      ? `${lessonIndex ?? '–'}${isCompact ? '' : `/${totalLessons}`}`
      : isCompact
        ? '•'
        : 'ЦИКЛ'

   return (
      <div className="flex items-center gap-0.5 sm:gap-1">
         {isRescheduled && (
            <span className="font-bold px-0.5 sm:px-1 py-0.2 rounded-xs bg-amber-500 text-white text-[7px] sm:text-[8px] leading-tight">
               {rescheduleLabel}
            </span>
         )}

         {isRecurring && (
            <span className="font-bold px-0.5 sm:px-1 py-0.2 rounded-xs bg-white/75 text-[#3E3A35] text-[7px] sm:text-[8px] leading-tight">
               {recurringLabel}
            </span>
         )}
      </div>
   )
}

function LessonComment({ text, isCompact }: LessonCommentProps) {
   if (!text) return null

   const iconSize = isCompact ? 'w-2 h-2' : 'w-2.5 h-2.5'

   return (
      <div className="flex items-center gap-0.5 text-[7px] sm:text-[9px] text-[#5A534A] opacity-70 italic ml-auto truncate max-w-[50%]">
         <MessageSquare className={`${iconSize} shrink-0`} />
         <span className="truncate">{text}</span>
      </div>
   )
}

export function LessonCard({
   lesson,
   dayDate,
   baseHour = 8,
   hourHeight = 56,
   startsAtDate,
   endsAtDate,
   column = 0,
   totalColumns = 1,
   onClick,
}: LessonCardProps) {
   const activeStartsAt = startsAtDate || new Date(lesson.startsAt)
   const activeEndsAt = endsAtDate || new Date(lesson.endsAt)

   const layout = calculateLessonCardLayout({
      startsAt: activeStartsAt,
      endsAt: activeEndsAt,
      baseHour,
      hourHeight,
      column,
      totalColumns,
   })

   if (!layout) return null

   const teacherName = resolveLessonTeacher(lesson, dayDate)
   const commentText = resolveLessonComment(lesson, dayDate)
   const isRescheduled = Boolean(getRescheduleForDate(lesson, dayDate))
   const lessonIndex = getLessonIndex(lesson, dayDate)
   const baseColor = lesson.color || '#8BA888'

   return (
      <div
         onClick={onClick}
         style={{
            top: `${layout.topPx}px`,
            height: `${layout.heightPx}px`,
            left: `calc(${layout.leftPercent}% + 1.5px)`,
            width: `calc(${layout.widthPercent}% - 3px)`,
            backgroundColor: `${baseColor}18`,
            borderColor: `${baseColor}80`,
         }}
         className={`absolute rounded-lg ${
            layout.isCompact ? 'p-1' : 'p-1.5'
         } border transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs hover:scale-[1.01] active:scale-[0.99] flex flex-col overflow-hidden group text-[#3E3A35] z-10`}
      >
         <div className="flex-1 min-h-0 flex flex-col justify-between">
            <div className="min-w-0">
               <div className="flex items-start justify-between gap-1 leading-none">
                  <h3 className="text-[10px] sm:text-[11px] font-bold leading-tight line-clamp-1 break-words flex-1">
                     {lesson.subject}
                  </h3>

                  <span className="text-[8px] sm:text-[9px] font-medium opacity-80 flex items-center gap-0.5 shrink-0 whitespace-nowrap">
                     <Clock className="w-2.5 h-2.5" />
                     {formatUtcTime(activeStartsAt)}
                  </span>
               </div>

               <div className="text-[8px] sm:text-[9px] mt-0.5 min-w-0">
                  <TeacherName fullName={teacherName} />
               </div>
            </div>

            <div
               style={{ borderColor: `${baseColor}30` }}
               className={`mt-auto flex items-center justify-between leading-none ${
                  layout.isCompact ? 'pt-0' : 'pt-0.5 border-t'
               }`}
            >
               <LessonBadges
                  isRescheduled={isRescheduled}
                  isRecurring={lesson.isRecurring}
                  lessonIndex={lessonIndex}
                  totalLessons={lesson.totalLessons}
                  isCompact={layout.isCompact}
               />

               <LessonComment text={commentText} isCompact={layout.isCompact} />
            </div>
         </div>
      </div>
   )
}
