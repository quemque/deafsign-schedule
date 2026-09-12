'use client'

import {
   Clock,
   MapPin,
   User as UserIcon,
   X,
   Edit,
   Trash2,
   MessageSquare,
} from 'lucide-react'
import type { ApiLesson } from '@/types/schedule'

interface LessonDetailsModalProps {
   lesson: ApiLesson
   isAdmin: boolean
   canEditComment: boolean
   commentText: string
   onCommentTextChange: (val: string) => void
   onSaveComment: () => void
   onClose: () => void
   onEdit: (lesson: ApiLesson) => void
   onDelete: (id: string) => void
}

export function LessonDetailsModal({
   lesson,
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

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2C2824]/40 backdrop-blur-xs animate-in fade-in duration-200">
         <div className="bg-white rounded-2xl shadow-2xl border border-[#E5E0D8] w-full max-w-lg max-h-[90dvh] flex flex-col overflow-hidden">
            <div className="p-4 sm:p-6 border-b bg-[#F5F2ED] border-[#E5E0D8] relative shrink-0">
               <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white text-[#8B857D] transition-colors"
               >
                  <X className="w-4 h-4" />
               </button>
               <div className="flex items-center gap-2 mb-2 pr-8 flex-wrap">
                  {lesson.isRecurring && (
                     <span className="text-[10px] font-semibold px-2 py-1 rounded-md bg-white border border-[#E5E0D8] text-[#8BA888]">
                        ЕЖЕНЕДЕЛЬНО
                     </span>
                  )}
                  <span className="text-[11px] font-medium text-[#8B857D] bg-white px-2 py-1 rounded-md border border-[#E5E0D8]">
                     {new Date(lesson.startsAt).toLocaleDateString('ru-RU', {
                        timeZone: 'UTC',
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
                     <div className="p-2 rounded-lg bg-white shadow-xs text-[#5A7A5A] shrink-0">
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
                  {lesson.room && (
                     <div className="flex items-start gap-3 p-3 rounded-xl bg-[#FDFCFB] border border-[#F0EDE8]">
                        <div className="p-2 rounded-lg bg-white shadow-xs text-[#5A7A5A] shrink-0">
                           <MapPin className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                           <span className="block text-[10px] sm:text-[11px] font-medium text-[#B0A89E] uppercase">
                              Аудитория
                           </span>
                           <span className="text-[11px] sm:text-xs font-bold text-[#3E3A35] truncate block">
                              {lesson.room}
                           </span>
                        </div>
                     </div>
                  )}
               </div>

               {lesson.teacher && (
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-[#FDFCFB] border border-[#F0EDE8]">
                     <div className="p-2 rounded-lg bg-white shadow-xs text-[#5A7A5A] shrink-0">
                        <UserIcon className="w-4 h-4" />
                     </div>
                     <div className="min-w-0">
                        <span className="block text-[10px] sm:text-[11px] font-medium text-[#B0A89E] uppercase">
                           Преподаватель
                        </span>
                        <span className="text-[11px] sm:text-xs font-bold text-[#3E3A35] truncate block">
                           {lesson.teacher.name}
                        </span>
                     </div>
                  </div>
               )}

               <div>
                  <h4 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#B0A89E] mb-2 flex items-center gap-1.5">
                     <MessageSquare className="w-3.5 h-3.5" /> Комментарий
                  </h4>
                  {canEditComment ? (
                     <div className="flex flex-col gap-2">
                        <textarea
                           value={commentText}
                           onChange={(e) => onCommentTextChange(e.target.value)}
                           placeholder="Добавить комментарий..."
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
                     <p className="text-[11px] sm:text-sm text-[#5A534A] leading-relaxed bg-[#FDFCFB]/50 p-3 sm:p-4 rounded-xl border border-[#F0EDE8]">
                        {lesson.comment || 'Нет комментариев'}
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
                        onClick={() => onEdit(lesson)}
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
                  className="w-full sm:w-auto px-6 py-2.5 text-xs font-semibold bg-[#8BA888] hover:bg-[#7A9A77] text-white rounded-xl transition-colors"
               >
                  Закрыть
               </button>
            </div>
         </div>
      </div>
   )
}
