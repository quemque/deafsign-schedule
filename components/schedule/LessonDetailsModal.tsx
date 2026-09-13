'use client'

import { useState } from 'react'
import {
   Clock,
   User as UserIcon,
   X,
   Edit,
   Trash2,
   MessageSquare,
   CalendarClock,
} from 'lucide-react'
import type { ApiLesson } from '@/types/schedule'

const INDEX_TO_DAY = [
   'SUNDAY',
   'MONDAY',
   'TUESDAY',
   'WEDNESDAY',
   'THURSDAY',
   'FRIDAY',
   'SATURDAY',
]

interface LessonDetailsModalProps {
   lesson: ApiLesson
   date?: Date
   isAdmin: boolean
   canEditComment: boolean
   commentText: string
   onCommentTextChange: (val: string) => void
   onSaveComment: () => void
   onClose: () => void
   onEdit: (lesson: ApiLesson, activeDate?: Date) => void
   onDelete: (id: string) => void
   onUpdate?: () => void
}

function renderTeacherName(fullName: string) {
   const parts = fullName.trim().split(/\s+/)
   if (!parts[0]) return null

   const [lastName, ...rest] = parts

   return (
      <span>
         <span className="text-red-500 font-bold">{lastName}</span>
         {rest.length > 0 ? ` ${rest.join(' ')}` : ''}
      </span>
   )
}

export function LessonDetailsModal({
   lesson,
   date,
   isAdmin,
   canEditComment,
   commentText,
   onCommentTextChange,
   onSaveComment,
   onClose,
   onEdit,
   onDelete,
   onUpdate,
}: LessonDetailsModalProps) {
   const [isRescheduleOpen, setIsRescheduleOpen] = useState(false)
   const [rescheduleDate, setRescheduleDate] = useState('')
   const [rescheduleStartTime, setRescheduleStartTime] = useState('09:00')
   const [rescheduleEndTime, setRescheduleEndTime] = useState('10:30')
   const [rescheduleError, setRescheduleError] = useState('')

   const formatTime = (iso: string | Date) =>
      new Date(iso).toLocaleTimeString('ru-RU', {
         timeZone: 'UTC',
         hour: '2-digit',
         minute: '2-digit',
      })

   const displayDate = date || new Date(lesson.startsAt)

   const yyyy = displayDate.getFullYear()
   const mm = String(displayDate.getMonth() + 1).padStart(2, '0')
   const dd = String(displayDate.getDate()).padStart(2, '0')
   const dateKey = `${yyyy}-${mm}-${dd}`
   const dayKey = INDEX_TO_DAY[displayDate.getDay()]

   const dateOverride = lesson.overrides?.find((o) => {
      const oDateStr =
         typeof o.date === 'string' ? o.date : new Date(o.date).toISOString()
      return oDateStr.startsWith(dateKey)
   })

   const rescheduleSlot = lesson.reschedules?.find((r) => {
      const rDateStr =
         typeof r.newStartsAt === 'string'
            ? r.newStartsAt.split('T')[0]
            : new Date(r.newStartsAt).toISOString().split('T')[0]
      return rDateStr === dateKey
   })

   const customDayTime = lesson.timeByDay?.[dayKey]

   let displayStartsAt: Date | string = lesson.startsAt
   let displayEndsAt: Date | string = lesson.endsAt

   if (rescheduleSlot) {
      displayStartsAt = rescheduleSlot.newStartsAt
      displayEndsAt = rescheduleSlot.newEndsAt
   } else if (
      lesson.isRecurring &&
      customDayTime?.startTime &&
      customDayTime?.endTime
   ) {
      const [sh, sm] = customDayTime.startTime.split(':').map(Number)
      const [eh, em] = customDayTime.endTime.split(':').map(Number)
      displayStartsAt = new Date(
         Date.UTC(
            yyyy,
            displayDate.getMonth(),
            displayDate.getDate(),
            sh,
            sm,
            0,
         ),
      )
      displayEndsAt = new Date(
         Date.UTC(
            yyyy,
            displayDate.getMonth(),
            displayDate.getDate(),
            eh,
            em,
            0,
         ),
      )
   }

   const daySpecificTeacher = lesson.teacherByDay?.[dayKey]

   const teacherDisplayName =
      dateOverride !== undefined
         ? dateOverride.customTeacherName
         : daySpecificTeacher ||
           lesson.customTeacherName ||
           lesson.teacher?.name

   const baseColor = lesson.color || '#8BA888'

   const handleRescheduleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setRescheduleError('')

      try {
         const res = await fetch(`/api/schedule/${lesson.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               action: 'reschedule',
               originalDate: dateKey,
               newDate: rescheduleDate,
               newStartTime: rescheduleStartTime,
               newEndTime: rescheduleEndTime,
            }),
         })

         if (!res.ok) {
            const data = await res.json().catch(() => null)
            throw new Error(data?.error || 'Ошибка при переносе')
         }

         setIsRescheduleOpen(false)
         onClose()
         onUpdate?.()
      } catch (err: any) {
         setRescheduleError(err.message || 'Ошибка переноса')
      }
   }

   return (
      <>
         <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#2C2824]/40 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-[#E5E0D8] w-full max-w-lg max-h-[92dvh] sm:max-h-[90dvh] flex flex-col overflow-hidden">
               <div
                  style={{ backgroundColor: `${baseColor}15` }}
                  className="p-4 sm:p-6 border-b border-[#E5E0D8] relative shrink-0"
               >
                  <button
                     onClick={onClose}
                     className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 p-2 rounded-full bg-white/80 hover:bg-white text-[#8B857D] transition-colors"
                  >
                     <X className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1.5 mb-2 pr-8 flex-wrap">
                     {rescheduleSlot && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 sm:py-1 rounded-md bg-amber-500 text-white shadow-2xs">
                           ПЕРЕНЕСЕНО
                        </span>
                     )}
                     {lesson.isRecurring && (
                        <span
                           style={{
                              color: baseColor,
                              borderColor: `${baseColor}50`,
                           }}
                           className="text-[10px] font-semibold px-2 py-0.5 sm:py-1 rounded-md bg-white border"
                        >
                           {lesson.totalLessons
                              ? `КУРС (${lesson.totalLessons} ЗАНЯТИЙ)`
                              : 'ЕЖЕНЕДЕЛЬНО'}
                        </span>
                     )}
                     <span className="text-[10px] sm:text-[11px] font-medium text-[#8B857D] bg-white px-2 py-0.5 sm:py-1 rounded-md border border-[#E5E0D8]">
                        {displayDate.toLocaleDateString('ru-RU', {
                           timeZone: date ? undefined : 'UTC',
                           day: 'numeric',
                           month: 'long',
                        })}
                     </span>
                  </div>

                  <h2 className="text-base sm:text-xl font-extrabold text-[#3E3A35] pr-8 leading-tight">
                     {lesson.subject}
                  </h2>
               </div>

               <div className="p-4 sm:p-6 space-y-3.5 sm:space-y-5 overflow-y-auto custom-scrollbar flex-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
                     <div className="flex items-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl bg-[#FDFCFB] border border-[#F0EDE8]">
                        <div
                           style={{ color: baseColor }}
                           className="p-1.5 sm:p-2 rounded-lg bg-white shadow-xs shrink-0"
                        >
                           <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </div>
                        <div className="min-w-0">
                           <span className="block text-[9px] sm:text-[11px] font-medium text-[#B0A89E] uppercase">
                              Время
                           </span>
                           <span className="text-[11px] sm:text-xs font-bold text-[#3E3A35] truncate block">
                              {formatTime(displayStartsAt)} –{' '}
                              {formatTime(displayEndsAt)}
                           </span>
                        </div>
                     </div>

                     {teacherDisplayName ? (
                        <div className="flex items-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl bg-[#FDFCFB] border border-[#F0EDE8]">
                           <div
                              style={{ color: baseColor }}
                              className="p-1.5 sm:p-2 rounded-lg bg-white shadow-xs shrink-0"
                           >
                              <UserIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                           </div>
                           <div className="min-w-0">
                              <span className="block text-[9px] sm:text-[11px] font-medium text-[#B0A89E] uppercase">
                                 Преподаватель
                              </span>
                              <span className="text-[11px] sm:text-xs font-bold text-[#3E3A35] truncate block">
                                 {renderTeacherName(teacherDisplayName)}
                              </span>
                           </div>
                        </div>
                     ) : (
                        <div className="flex items-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl bg-[#FDFCFB] border border-[#F0EDE8]">
                           <div className="p-1.5 sm:p-2 rounded-lg bg-white shadow-xs text-gray-400 shrink-0">
                              <UserIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                           </div>
                           <div className="min-w-0">
                              <span className="block text-[9px] sm:text-[11px] font-medium text-[#B0A89E] uppercase">
                                 Преподаватель
                              </span>
                              <span className="text-[11px] sm:text-xs text-[#8B857D] italic truncate block">
                                 Не назначен
                              </span>
                           </div>
                        </div>
                     )}
                  </div>

                  <div>
                     <h4 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#B0A89E] mb-1.5 sm:mb-2 flex items-center gap-1.5">
                        <MessageSquare className="w-3 h-3 sm:w-3.5 sm:h-3.5" />{' '}
                        Комментарий
                     </h4>
                     {canEditComment ? (
                        <div className="flex flex-col gap-2">
                           <textarea
                              value={commentText}
                              onChange={(e) =>
                                 onCommentTextChange(e.target.value)
                              }
                              placeholder="Добавить комментарий..."
                              className="w-full bg-[#FDFCFB] border border-[#F0EDE8] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm resize-none focus:outline-none focus:border-[#8BA888]"
                              rows={2}
                           />
                           <button
                              onClick={onSaveComment}
                              className="self-end px-4 py-1.5 text-xs font-semibold bg-[#F5F2ED] hover:bg-[#EDE8E0] text-[#3E3A35] border border-[#E5E0D8] transition-colors rounded-lg"
                           >
                              Сохранить
                           </button>
                        </div>
                     ) : (
                        <p className="text-[11px] sm:text-sm text-[#5A534A] leading-relaxed bg-[#FDFCFB]/50 p-2.5 sm:p-4 rounded-xl border border-[#F0EDE8] whitespace-pre-wrap">
                           {commentText ? commentText : 'Нет комментариев'}
                        </p>
                     )}
                  </div>
               </div>

               <div className="p-3 sm:p-6 border-t border-[#F0EDE8] bg-[#FDFCFB] shrink-0 flex items-center justify-between gap-2">
                  {isAdmin ? (
                     <div className="flex gap-1.5 w-auto">
                        <button
                           onClick={() => onDelete(lesson.id)}
                           className="flex justify-center p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
                        >
                           <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                           onClick={() => {
                              setRescheduleDate(dateKey)
                              setRescheduleStartTime(
                                 formatTime(displayStartsAt),
                              )
                              setRescheduleEndTime(formatTime(displayEndsAt))
                              setIsRescheduleOpen(true)
                           }}
                           className="flex items-center gap-1 px-2.5 py-2 rounded-lg bg-[#F5F2ED] hover:bg-[#EDE8E0] text-[#3E3A35] text-xs font-semibold transition-colors"
                        >
                           <CalendarClock className="w-3.5 h-3.5 text-[#8BA888]" />
                           <span className="hidden xs:inline">Перенести</span>
                        </button>
                        <button
                           onClick={() => onEdit(lesson, displayDate)}
                           className="flex justify-center p-2 rounded-lg bg-[#F5F2ED] hover:bg-[#EDE8E0] text-[#8B857D] transition-colors"
                        >
                           <Edit className="w-4 h-4" />
                        </button>
                     </div>
                  ) : (
                     <div />
                  )}
                  <button
                     onClick={onClose}
                     style={{ backgroundColor: baseColor }}
                     className="px-5 py-2 text-xs font-semibold text-white rounded-xl transition-opacity hover:opacity-90 ml-auto"
                  >
                     Закрыть
                  </button>
               </div>
            </div>
         </div>

         {isRescheduleOpen && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-[#2C2824]/50 backdrop-blur-xs animate-in fade-in">
               <div className="bg-white rounded-2xl p-4 sm:p-6 max-w-sm w-full border border-[#E5E0D8] shadow-2xl relative">
                  <h3 className="font-bold text-sm sm:text-base text-[#3E3A35] mb-1.5">
                     Перенос занятия
                  </h3>
                  <p className="text-xs text-[#8B857D] mb-3">
                     Новая дата и время для занятия с{' '}
                     <span className="font-bold text-[#3E3A35]">{dateKey}</span>
                     .
                  </p>

                  <form
                     onSubmit={handleRescheduleSubmit}
                     className="space-y-2.5"
                  >
                     <div>
                        <label className="text-[10px] font-medium text-[#8B857D] mb-1 block pl-1">
                           Новая дата
                        </label>
                        <input
                           type="date"
                           value={rescheduleDate}
                           onChange={(e) => setRescheduleDate(e.target.value)}
                           required
                           className="w-full bg-[#F5F2ED]/70 focus:bg-white border border-[#E5E0D8] focus:border-[#8BA888] focus:outline-none transition-colors rounded-xl px-3 py-1.5 text-xs"
                        />
                     </div>

                     <div className="grid grid-cols-2 gap-2">
                        <div>
                           <label className="text-[10px] font-medium text-[#8B857D] mb-1 block pl-1">
                              Начало
                           </label>
                           <input
                              type="time"
                              value={rescheduleStartTime}
                              onChange={(e) =>
                                 setRescheduleStartTime(e.target.value)
                              }
                              required
                              className="w-full bg-[#F5F2ED]/70 focus:bg-white border border-[#E5E0D8] focus:border-[#8BA888] focus:outline-none transition-colors rounded-xl px-2.5 py-1.5 text-xs"
                           />
                        </div>
                        <div>
                           <label className="text-[10px] font-medium text-[#8B857D] mb-1 block pl-1">
                              Конец
                           </label>
                           <input
                              type="time"
                              value={rescheduleEndTime}
                              onChange={(e) =>
                                 setRescheduleEndTime(e.target.value)
                              }
                              required
                              className="w-full bg-[#F5F2ED]/70 focus:bg-white border border-[#E5E0D8] focus:border-[#8BA888] focus:outline-none transition-colors rounded-xl px-2.5 py-1.5 text-xs"
                           />
                        </div>
                     </div>

                     {rescheduleError && (
                        <div className="p-2 rounded-lg bg-red-50 text-[10px] text-red-600 border border-red-100">
                           {rescheduleError}
                        </div>
                     )}

                     <div className="pt-2 flex gap-2">
                        <button
                           type="button"
                           onClick={() => setIsRescheduleOpen(false)}
                           className="flex-1 py-2 text-xs font-semibold rounded-xl bg-[#F5F2ED] hover:bg-[#EDE8E0] text-[#3E3A35] transition-colors"
                        >
                           Отмена
                        </button>
                        <button
                           type="submit"
                           className="flex-1 py-2 text-xs font-semibold rounded-xl bg-[#8BA888] hover:bg-[#7A9A77] text-white shadow-sm shadow-[#8BA888]/20 transition-colors"
                        >
                           Перенести
                        </button>
                     </div>
                  </form>
               </div>
            </div>
         )}
      </>
   )
}
