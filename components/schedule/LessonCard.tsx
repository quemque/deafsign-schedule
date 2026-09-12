'use client'

import { Clock, MessageSquare } from 'lucide-react'
import type { ApiLesson } from '@/types/schedule'

interface LessonCardProps {
   lesson: ApiLesson
   dayDate: Date
   onClick: () => void
}

export function LessonCard({ lesson, dayDate, onClick }: LessonCardProps) {
   const startsAt = new Date(lesson.startsAt)
   const endsAt = new Date(lesson.endsAt)

   const startMinutesFrom8 =
      (startsAt.getUTCHours() - 8) * 60 + startsAt.getUTCMinutes()
   const durationMinutes = (endsAt.getTime() - startsAt.getTime()) / 60000

   if (startMinutesFrom8 < 0) return null

   const topPx = (startMinutesFrom8 / 60) * 96
   const heightPx = Math.max((durationMinutes / 60) * 96, 56)

   const formatTime = (iso: string) =>
      new Date(iso).toLocaleTimeString('ru-RU', {
         timeZone: 'UTC',
         hour: '2-digit',
         minute: '2-digit',
      })

   // Формируем YYYY-MM-DD для текущего дня карточки
   const yyyy = dayDate.getFullYear()
   const mm = String(dayDate.getMonth() + 1).padStart(2, '0')
   const dd = String(dayDate.getDate()).padStart(2, '0')
   const dateKey = `${yyyy}-${mm}-${dd}`

   // Ищем комментарий, привязанный к этой дате
   const currentComment =
      lesson.comments?.find((c) => {
         const commentDateStr =
            typeof c.date === 'string' ? c.date : new Date(c.date).toISOString()
         return commentDateStr.startsWith(dateKey)
      })?.text || ''

   return (
      <div
         onClick={onClick}
         style={{ top: `${topPx}px`, height: `${heightPx}px` }}
         className="absolute left-1 right-1 rounded-xl p-2 sm:p-2.5 border transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] flex flex-col overflow-hidden group bg-[#E8F0E8] border-[#8BA888] text-[#3E3A35] z-10"
      >
         <div className="flex-1 min-h-0 flex flex-col">
            <div className="flex items-start justify-between gap-1 mb-1">
               <h3 className="text-[11px] sm:text-xs font-bold leading-tight line-clamp-2 break-words flex-1">
                  {lesson.subject}
               </h3>
               <span className="text-[9px] sm:text-[10px] font-medium opacity-80 flex items-center gap-0.5 shrink-0 whitespace-nowrap">
                  <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  {formatTime(lesson.startsAt)}
               </span>
            </div>

            <div className="mt-auto pt-1 flex flex-col gap-0.5 border-t border-[#8BA888]/30">
               <div className="flex items-center justify-between text-[9px] sm:text-[10px] opacity-75">
                  <span className="truncate font-medium">
                     {[lesson.teacher?.name, lesson.room]
                        .filter(Boolean)
                        .join(' • ')}
                  </span>
                  {lesson.isRecurring && (
                     <span className="text-[8px] font-bold px-1 py-0.5 rounded-sm bg-white/50 ml-1">
                        ЦИКЛ
                     </span>
                  )}
               </div>
               {currentComment && (
                  <div className="flex items-center gap-1 text-[9px] text-[#5A534A] opacity-70 italic mt-0.5">
                     <MessageSquare className="w-2.5 h-2.5 shrink-0" />
                     <span className="truncate">{currentComment}</span>
                  </div>
               )}
            </div>
         </div>
      </div>
   )
}
