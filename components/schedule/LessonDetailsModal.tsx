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
import {
   formatDateKey,
   formatUtcTime,
   resolveLessonComment,
   resolveLessonDisplayTimes,
   resolveLessonTeacher,
} from '@/utils/lesson'
import { TeacherName } from './TeacherName'
import { RescheduleModal } from './RescheduleModal'

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

interface HeaderProps {
   subject: string
   baseColor: string
   displayDate: Date
   hasExplicitDate: boolean
   isRescheduled: boolean
   isRecurring: boolean
   totalLessons?: number | null
   onClose: () => void
}

interface InfoGridProps {
   baseColor: string
   startsAt: Date | string
   endsAt: Date | string
   teacherName?: string
}

interface CommentSectionProps {
   canEdit: boolean
   text: string
   onChange: (val: string) => void
   onSave: () => void
}

interface FooterProps {
   isAdmin: boolean
   baseColor: string
   onDelete: () => void
   onOpenReschedule: () => void
   onEdit: () => void
   onClose: () => void
}

function LessonDetailsHeader({
   subject,
   baseColor,
   displayDate,
   hasExplicitDate,
   isRescheduled,
   isRecurring,
   totalLessons,
   onClose,
}: HeaderProps) {
   const formattedDate = displayDate.toLocaleDateString('ru-RU', {
      timeZone: hasExplicitDate ? undefined : 'UTC',
      day: 'numeric',
      month: 'long',
   })

   return (
      <div
         style={{ backgroundColor: `${baseColor}15` }}
         className="p-4 sm:p-6 border-b border-[#E5E0D8] relative shrink-0"
      >
         <button
            type="button"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 p-2 rounded-full bg-white/80 hover:bg-white text-[#8B857D] transition-colors"
            aria-label="Закрыть"
         >
            <X className="w-4 h-4" />
         </button>

         <div className="flex items-center gap-1.5 mb-2 pr-8 flex-wrap">
            {isRescheduled && (
               <span className="text-[10px] font-semibold px-2 py-0.5 sm:py-1 rounded-md bg-amber-500 text-white shadow-2xs">
                  ПЕРЕНЕСЕНО
               </span>
            )}

            {isRecurring && (
               <span
                  style={{
                     color: baseColor,
                     borderColor: `${baseColor}50`,
                  }}
                  className="text-[10px] font-semibold px-2 py-0.5 sm:py-1 rounded-md bg-white border"
               >
                  {totalLessons
                     ? `КУРС (${totalLessons} ЗАНЯТИЙ)`
                     : 'ЕЖЕНЕДЕЛЬНО'}
               </span>
            )}

            <span className="text-[10px] sm:text-[11px] font-medium text-[#8B857D] bg-white px-2 py-0.5 sm:py-1 rounded-md border border-[#E5E0D8]">
               {formattedDate}
            </span>
         </div>

         <h2 className="text-base sm:text-xl font-extrabold text-[#3E3A35] pr-8 leading-tight">
            {subject}
         </h2>
      </div>
   )
}

function LessonInfoGrid({
   baseColor,
   startsAt,
   endsAt,
   teacherName,
}: InfoGridProps) {
   const startTimeStr = formatUtcTime(new Date(startsAt))
   const endTimeStr = formatUtcTime(new Date(endsAt))

   return (
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
                  {startTimeStr} – {endTimeStr}
               </span>
            </div>
         </div>

         <div className="flex items-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl bg-[#FDFCFB] border border-[#F0EDE8]">
            <div
               style={{ color: teacherName ? baseColor : undefined }}
               className={`p-1.5 sm:p-2 rounded-lg bg-white shadow-xs shrink-0 ${
                  !teacherName ? 'text-gray-400' : ''
               }`}
            >
               <UserIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0">
               <span className="block text-[9px] sm:text-[11px] font-medium text-[#B0A89E] uppercase">
                  Преподаватель
               </span>
               <span className="text-[11px] sm:text-xs font-bold text-[#3E3A35] truncate block">
                  <TeacherName
                     fullName={teacherName}
                     fallbackText="Не назначен"
                  />
               </span>
            </div>
         </div>
      </div>
   )
}

function LessonCommentSection({
   canEdit,
   text,
   onChange,
   onSave,
}: CommentSectionProps) {
   return (
      <div>
         <h4 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#B0A89E] mb-1.5 sm:mb-2 flex items-center gap-1.5">
            <MessageSquare className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Комментарий
         </h4>

         {canEdit ? (
            <div className="flex flex-col gap-2">
               <textarea
                  value={text}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder="Добавить комментарий..."
                  className="w-full bg-[#FDFCFB] border border-[#F0EDE8] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm resize-none focus:outline-none focus:border-[#8BA888]"
                  rows={2}
               />
               <button
                  type="button"
                  onClick={onSave}
                  className="self-end px-4 py-1.5 text-xs font-semibold bg-[#F5F2ED] hover:bg-[#EDE8E0] text-[#3E3A35] border border-[#E5E0D8] transition-colors rounded-lg"
               >
                  Сохранить
               </button>
            </div>
         ) : (
            <p className="text-[11px] sm:text-sm text-[#5A534A] leading-relaxed bg-[#FDFCFB]/50 p-2.5 sm:p-4 rounded-xl border border-[#F0EDE8] whitespace-pre-wrap">
               {text || 'Нет комментариев'}
            </p>
         )}
      </div>
   )
}

function LessonDetailsFooter({
   isAdmin,
   baseColor,
   onDelete,
   onOpenReschedule,
   onEdit,
   onClose,
}: FooterProps) {
   return (
      <div className="p-3 sm:p-6 border-t border-[#F0EDE8] bg-[#FDFCFB] shrink-0 flex items-center justify-between gap-2">
         {isAdmin ? (
            <div className="flex gap-1.5 w-auto">
               <button
                  type="button"
                  onClick={onDelete}
                  className="flex justify-center p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
                  aria-label="Удалить"
               >
                  <Trash2 className="w-4 h-4" />
               </button>

               <button
                  type="button"
                  onClick={onOpenReschedule}
                  className="flex items-center gap-1 px-2.5 py-2 rounded-lg bg-[#F5F2ED] hover:bg-[#EDE8E0] text-[#3E3A35] text-xs font-semibold transition-colors"
               >
                  <CalendarClock className="w-3.5 h-3.5 text-[#8BA888]" />
                  <span className="hidden xs:inline">Перенести</span>
               </button>

               <button
                  type="button"
                  onClick={onEdit}
                  className="flex justify-center p-2 rounded-lg bg-[#F5F2ED] hover:bg-[#EDE8E0] text-[#8B857D] transition-colors"
                  aria-label="Редактировать"
               >
                  <Edit className="w-4 h-4" />
               </button>
            </div>
         ) : (
            <div />
         )}

         <button
            type="button"
            onClick={onClose}
            style={{ backgroundColor: baseColor }}
            className="px-5 py-2 text-xs font-semibold text-white rounded-xl transition-opacity hover:opacity-90 ml-auto"
         >
            Закрыть
         </button>
      </div>
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

   const displayDate = date || new Date(lesson.startsAt)
   const dateKey = formatDateKey(displayDate)
   const teacherName = resolveLessonTeacher(lesson, displayDate)
   const activeComment =
      commentText || resolveLessonComment(lesson, displayDate)
   const { startsAt, endsAt, isRescheduled } = resolveLessonDisplayTimes(
      lesson,
      displayDate,
   )

   const baseColor = lesson.color || '#8BA888'
   const startTimeStr = formatUtcTime(new Date(startsAt))
   const endTimeStr = formatUtcTime(new Date(endsAt))

   const handleRescheduleSuccess = () => {
      onClose()
      onUpdate?.()
   }

   return (
      <>
         <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#2C2824]/40 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-[#E5E0D8] w-full max-w-lg max-h-[92dvh] sm:max-h-[90dvh] flex flex-col overflow-hidden">
               <LessonDetailsHeader
                  subject={lesson.subject}
                  baseColor={baseColor}
                  displayDate={displayDate}
                  hasExplicitDate={Boolean(date)}
                  isRescheduled={isRescheduled}
                  isRecurring={lesson.isRecurring}
                  totalLessons={lesson.totalLessons}
                  onClose={onClose}
               />

               <div className="p-4 sm:p-6 space-y-3.5 sm:space-y-5 overflow-y-auto custom-scrollbar flex-1">
                  <LessonInfoGrid
                     baseColor={baseColor}
                     startsAt={startsAt}
                     endsAt={endsAt}
                     teacherName={teacherName}
                  />

                  <LessonCommentSection
                     canEdit={canEditComment}
                     text={activeComment}
                     onChange={onCommentTextChange}
                     onSave={onSaveComment}
                  />
               </div>

               <LessonDetailsFooter
                  isAdmin={isAdmin}
                  baseColor={baseColor}
                  onDelete={() => onDelete(lesson.id)}
                  onOpenReschedule={() => setIsRescheduleOpen(true)}
                  onEdit={() => onEdit(lesson, displayDate)}
                  onClose={onClose}
               />
            </div>
         </div>

         <RescheduleModal
            isOpen={isRescheduleOpen}
            lessonId={lesson.id}
            dateKey={dateKey}
            initialStartTime={startTimeStr}
            initialEndTime={endTimeStr}
            onClose={() => setIsRescheduleOpen(false)}
            onSuccess={handleRescheduleSuccess}
         />
      </>
   )
}
