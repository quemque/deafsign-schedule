'use client'

import { useState, useEffect } from 'react'
import { Info, BookOpen, MessageSquare } from 'lucide-react'
import {
   formatDateKey,
   formatUtcTime,
   resolveLessonComment,
   resolveLessonDisplayTimes,
   resolveLessonTeacher,
} from '@/utils/lesson'
import { useModalStore } from '@/stores/useModalStore'
import { useCurrentUserQuery } from '@/hooks/useScheduleQueries'
import { useScheduleMutations } from '@/hooks/useScheduleMutations'
import { LessonDetailsHeader } from './modal/LessonDetailsHeader'
import { LessonInfoGrid } from './modal/LessonInfoGrid'
import { LessonCommentSection } from './modal/LessonCommentSection'
import { LessonDetailsFooter } from './modal/LessonDetailsFooter'
import { HomeworkTab } from './homework/HomeworkTab'

type ModalTab = 'info' | 'homework' | 'note'

export function LessonDetailsModal() {
   const {
      detailsModal,
      closeDetails,
      openEditForm,
      openDeleteConfirm,
      openReschedule,
   } = useModalStore()
   const { data: user } = useCurrentUserQuery()
   const { saveComment } = useScheduleMutations()

   const { lesson, date, isOpen } = detailsModal

   const [activeTab, setActiveTab] = useState<ModalTab>('info')
   const [commentText, setCommentText] = useState('')

   const displayDate = date || (lesson ? new Date(lesson.startsAt) : new Date())

   useEffect(() => {
      if (!lesson || !isOpen) return
      const currentComment = resolveLessonComment(lesson, displayDate)
      setCommentText(currentComment)
      setActiveTab('info')
   }, [lesson, isOpen, displayDate])

   if (!isOpen || !lesson) return null

   const isAdmin = user?.role === 'ADMIN'
   const isTeacher = user?.role === 'TEACHER'
   const canManage = isAdmin || isTeacher

   const dateKey = formatDateKey(displayDate)
   const teacherName = resolveLessonTeacher(lesson, displayDate)
   const { startsAt, endsAt, isRescheduled } = resolveLessonDisplayTimes(
      lesson,
      displayDate,
   )

   const baseColor = lesson.color || '#8BA888'
   const startTimeStr = formatUtcTime(new Date(startsAt))
   const endTimeStr = formatUtcTime(new Date(endsAt))

   const handleSaveComment = async () => {
      const yyyy = displayDate.getFullYear()
      const mm = String(displayDate.getMonth() + 1).padStart(2, '0')
      const dd = String(displayDate.getDate()).padStart(2, '0')
      const targetDate = `${yyyy}-${mm}-${dd}`

      await saveComment({
         lessonId: lesson.id,
         date: targetDate,
         text: commentText,
      })
   }

   const isHomeworkTab = activeTab === 'homework'

   return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#2C2824]/40 backdrop-blur-xs animate-in fade-in duration-200">
         <div
            className={`bg-white shadow-2xl border border-[#E5E0D8] w-full flex flex-col overflow-hidden transition-all duration-200 ${
               isHomeworkTab
                  ? 'h-[100dvh] sm:h-auto sm:max-h-[92dvh] sm:max-w-4xl rounded-none sm:rounded-2xl'
                  : 'max-h-[92dvh] sm:max-h-[90dvh] max-w-lg rounded-t-3xl sm:rounded-2xl'
            }`}
         >
            <LessonDetailsHeader
               subject={lesson.subject}
               baseColor={baseColor}
               displayDate={displayDate}
               hasExplicitDate={Boolean(date)}
               isRescheduled={isRescheduled}
               isRecurring={lesson.isRecurring}
               totalLessons={lesson.totalLessons}
               onClose={closeDetails}
            />

            <div className="flex border-b border-[#E5E0D8] px-4 sm:px-6 bg-white gap-4 shrink-0">
               <button
                  type="button"
                  onClick={() => setActiveTab('info')}
                  className={`flex items-center gap-1.5 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                     activeTab === 'info'
                        ? 'border-[#8BA888] text-[#3E3A35]'
                        : 'border-transparent text-[#8B857D] hover:text-[#3E3A35]'
                  }`}
               >
                  <Info className="w-3.5 h-3.5" />
                  <span>Информация</span>
               </button>

               <button
                  type="button"
                  onClick={() => setActiveTab('homework')}
                  className={`flex items-center gap-1.5 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                     activeTab === 'homework'
                        ? 'border-[#8BA888] text-[#3E3A35]'
                        : 'border-transparent text-[#8B857D] hover:text-[#3E3A35]'
                  }`}
               >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Домашнее задание</span>
               </button>

               {canManage && (
                  <button
                     type="button"
                     onClick={() => setActiveTab('note')}
                     className={`flex items-center gap-1.5 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                        activeTab === 'note'
                           ? 'border-[#8BA888] text-[#3E3A35]'
                           : 'border-transparent text-[#8B857D] hover:text-[#3E3A35]'
                     }`}
                  >
                     <MessageSquare className="w-3.5 h-3.5" />
                     <span>Заметка</span>
                  </button>
               )}
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1">
               {activeTab === 'info' && (
                  <LessonInfoGrid
                     baseColor={baseColor}
                     startsAt={startsAt}
                     endsAt={endsAt}
                     teacherName={teacherName}
                  />
               )}

               {activeTab === 'homework' && (
                  <HomeworkTab
                     lessonId={lesson.id}
                     date={dateKey}
                     canEdit={canManage}
                  />
               )}

               {activeTab === 'note' && canManage && (
                  <LessonCommentSection
                     canEdit={canManage}
                     text={commentText}
                     onChange={setCommentText}
                     onSave={handleSaveComment}
                  />
               )}
            </div>

            <LessonDetailsFooter
               isAdmin={isAdmin}
               baseColor={baseColor}
               onDelete={() => openDeleteConfirm(lesson, displayDate)}
               onOpenReschedule={() =>
                  openReschedule(lesson.id, dateKey, startTimeStr, endTimeStr)
               }
               onEdit={() => {
                  closeDetails()
                  openEditForm(lesson, displayDate)
               }}
               onClose={closeDetails}
            />
         </div>
      </div>
   )
}
