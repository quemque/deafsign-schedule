'use client'

import {
   Clock,
   User as UserIcon,
   X,
   Edit,
   Trash2,
   MessageSquare,
} from 'lucide-react'
import type { ApiLesson } from '@/types/schedule'

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
}: LessonDetailsModalProps) {
   const formatTime = (iso: string) =>
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

   const dateOverride = lesson.overrides?.find((o) => {
      const oDateStr =
         typeof o.date === 'string' ? o.date : new Date(o.date).toISOString()
      return oDateStr.startsWith(dateKey)
   })

   const teacherDisplayName =
      dateOverride !== undefined
         ? dateOverride.customTeacherName
         : lesson.customTeacherName || lesson.teacher?.name

   const baseColor = lesson.color || '#8BA888'

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2C2824]/40 backdrop-blur-xs animate-in fade-in duration-200">
         <div className="bg-white rounded-2xl shadow-2xl border border-[#E5E0D8] w-full max-w-lg max-h-[90dvh] flex flex-col overflow-hidden">
            <div
               style={{ backgroundColor: `${baseColor}15` }}
               className="p-4 sm:p-6 border-b border-[#E5E0D8] relative shrink-0"
            >
               <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white text-[#8B857D] transition-colors"
               >
                  <X className="w-4 h-4" />
               </button>

               <div className="flex items-center gap-2 mb-2 pr-8 flex-wrap">
                  {lesson.isRecurring && (
                     <span
                        style={{
                           color: baseColor,
                           borderColor: `${baseColor}50`,
                        }}
                        className="text-[10px] font-semibold px-2 py-1 rounded-md bg-white border"
                     >
                        {lesson.totalLessons
                           ? `КУРС (${lesson.totalLessons} ЗАНЯТИЙ)`
                           : 'ЕЖЕНЕДЕЛЬНО'}
                     </span>
                  )}
                  <span className="text-[11px] font-medium text-[#8B857D] bg-white px-2 py-1 rounded-md border border-[#E5E0D8]">
                     {displayDate.toLocaleDateString('ru-RU', {
                        timeZone: date ? undefined : 'UTC',
                        day: 'numeric',
                        month: 'long',
                     })}
                  </span>
               </div>

               <h2 className="text-lg sm:text-xl font-extrabold text-[#3E3A35] pr-8 leading-tight">
                  {lesson.subject}
               </h2>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto custom-scrollbar flex-1">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-[#FDFCFB] border border-[#F0EDE8]">
                     <div
                        style={{ color: baseColor }}
                        className="p-2 rounded-lg bg-white shadow-xs shrink-0"
                     >
                        <Clock className="w-4 h-4" />
                     </div>
                     <div className="min-w-0">
                        <span className="block text-[10px] sm:text-[11px] font-medium text-[#B0A89E] uppercase">
                           Время
                        </span>
                        <span className="text-[11px] sm:text-xs font-bold text-[#3E3A35] truncate block">
                           {formatTime(lesson.startsAt)} –{' '}
                           {formatTime(lesson.endsAt)}
                        </span>
                     </div>
                  </div>

                  {teacherDisplayName ? (
                     <div className="flex items-start gap-3 p-3 rounded-xl bg-[#FDFCFB] border border-[#F0EDE8]">
                        <div
                           style={{ color: baseColor }}
                           className="p-2 rounded-lg bg-white shadow-xs shrink-0"
                        >
                           <UserIcon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                           <span className="block text-[10px] sm:text-[11px] font-medium text-[#B0A89E] uppercase">
                              Преподаватель
                           </span>
                           <span className="text-[11px] sm:text-xs font-bold text-[#3E3A35] truncate block">
                              {renderTeacherName(teacherDisplayName)}
                           </span>
                        </div>
                     </div>
                  ) : (
                     <div className="flex items-start gap-3 p-3 rounded-xl bg-[#FDFCFB] border border-[#F0EDE8]">
                        <div className="p-2 rounded-lg bg-white shadow-xs text-gray-400 shrink-0">
                           <UserIcon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                           <span className="block text-[10px] sm:text-[11px] font-medium text-[#B0A89E] uppercase">
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
                  <h4 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#B0A89E] mb-2 flex items-center gap-1.5">
                     <MessageSquare className="w-3.5 h-3.5" /> Комментарий
                  </h4>
                  {canEditComment ? (
                     <div className="flex flex-col gap-2">
                        <textarea
                           value={commentText}
                           onChange={(e) => onCommentTextChange(e.target.value)}
                           placeholder="Добавить комментарий на этот день..."
                           className="w-full bg-[#FDFCFB] border border-[#F0EDE8] rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-[#8BA888]"
                           rows={3}
                        />
                        <button
                           onClick={onSaveComment}
                           className="self-end px-5 py-2 text-xs font-semibold bg-[#F5F2ED] hover:bg-[#EDE8E0] text-[#3E3A35] border border-[#E5E0D8] transition-colors rounded-lg"
                        >
                           Сохранить
                        </button>
                     </div>
                  ) : (
                     <p className="text-[11px] sm:text-sm text-[#5A534A] leading-relaxed bg-[#FDFCFB]/50 p-3 sm:p-4 rounded-xl border border-[#F0EDE8] whitespace-pre-wrap">
                        {commentText ? commentText : 'Нет комментариев'}
                     </p>
                  )}
               </div>
            </div>

            <div className="p-4 sm:p-6 border-t border-[#F0EDE8] bg-[#FDFCFB] shrink-0 flex flex-wrap-reverse items-center justify-between gap-3">
               {isAdmin ? (
                  <div className="flex gap-2 w-full sm:w-auto">
                     <button
                        onClick={() => onDelete(lesson.id)}
                        className="flex-1 sm:flex-none flex justify-center p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
                     >
                        <Trash2 className="w-4 h-4" />
                     </button>
                     <button
                        onClick={() => onEdit(lesson, displayDate)}
                        className="flex-1 sm:flex-none flex justify-center p-2 rounded-lg bg-[#F5F2ED] hover:bg-[#EDE8E0] text-[#8B857D] transition-colors"
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
                  className="w-full sm:w-auto px-6 py-2.5 text-xs font-semibold text-white rounded-xl transition-opacity hover:opacity-90"
               >
                  Закрыть
               </button>
            </div>
         </div>
      </div>
   )
}
