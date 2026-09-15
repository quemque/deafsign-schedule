'use client'

import { useState } from 'react'
import { useScheduleData } from '@/hooks/useScheduleData'
import { useLessonForm } from '@/hooks/useLessonForm'
import { useLessonDetails } from '@/hooks/useLessonDetails'

import { ScheduleHeader } from '@/components/schedule/ScheduleHeader'
import { ScheduleSubHeader } from '@/components/schedule/ScheduleSubHeader'
import { ScheduleGrid } from '@/components/schedule/ScheduleGrid'
import { LessonDetailsModal } from '@/components/schedule/LessonDetailsModal'
import { LessonFormModal } from '@/components/schedule/LessonFormModal'
import { DeleteLessonConfirmModal } from '@/components/schedule/DeleteLessonConfirmModal'

export default function SchedulePage() {
   const {
      user,
      loading,
      currentDate,
      setCurrentDate,
      currentTime,
      weekDates,
      currentWeekLabel,
      visibleLessons,
      prevWeek,
      nextWeek,
      setToday,
      refreshSchedule,
   } = useScheduleData()

   const lessonForm = useLessonForm(refreshSchedule)
   const lessonDetails = useLessonDetails(refreshSchedule)

   const [mobileViewMode, setMobileViewMode] = useState<'day' | 'week'>('day')
   const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)

   const isAdmin = user?.role === 'ADMIN'
   const canEditComment = user?.role === 'ADMIN' || user?.role === 'TEACHER'

   return (
      <div className="h-[100dvh] bg-[#FAF8F5] text-[#3E3A35] font-sans antialiased flex flex-col selection:bg-[#8BA888] selection:text-white overflow-hidden">
         <ScheduleHeader isAdmin={isAdmin} />

         <ScheduleSubHeader
            currentWeekLabel={currentWeekLabel}
            weekDates={weekDates}
            currentDate={currentDate}
            isAdmin={isAdmin}
            mobileViewMode={mobileViewMode}
            onMobileViewModeChange={setMobileViewMode}
            onPrevWeek={prevWeek}
            onNextWeek={nextWeek}
            onSetToday={setToday}
            onSelectDate={setCurrentDate}
            onOpenCreate={() => lessonForm.openCreate(currentDate)}
         />

         <main className="flex-1 min-h-0 max-w-7xl w-full mx-auto p-2 sm:p-4 lg:p-6 flex flex-col">
            {loading ? (
               <div className="flex-1 flex items-center justify-center text-[#8B857D] text-sm">
                  Загрузка...
               </div>
            ) : (
               <ScheduleGrid
                  weekDates={weekDates}
                  currentDate={currentDate}
                  currentTime={currentTime}
                  visibleLessons={visibleLessons}
                  mobileViewMode={mobileViewMode}
                  onSelectDate={setCurrentDate}
                  onSelectLesson={(lesson, dayDate) =>
                     lessonDetails.openDetails(lesson, dayDate)
                  }
               />
            )}
         </main>

         {lessonDetails.activeLesson && !lessonForm.isOpen && (
            <LessonDetailsModal
               lesson={lessonDetails.activeLesson}
               date={lessonDetails.selectedDate}
               isAdmin={isAdmin}
               canEditComment={canEditComment}
               commentText={lessonDetails.commentText}
               onCommentTextChange={lessonDetails.setCommentText}
               onSaveComment={lessonDetails.saveComment}
               onClose={lessonDetails.closeDetails}
               onEdit={(lesson, activeDate) => {
                  lessonDetails.closeDetails()
                  lessonForm.openEdit(lesson, activeDate)
               }}
               onDelete={() => setIsDeleteConfirmOpen(true)}
               onUpdate={refreshSchedule}
            />
         )}

         {lessonDetails.activeLesson && (
            <DeleteLessonConfirmModal
               isOpen={isDeleteConfirmOpen}
               isRecurring={lessonDetails.activeLesson.isRecurring}
               date={lessonDetails.selectedDate}
               onClose={() => setIsDeleteConfirmOpen(false)}
               onConfirm={(mode) => {
                  setIsDeleteConfirmOpen(false)
                  lessonDetails.deleteActiveLesson(mode)
               }}
            />
         )}

         {lessonForm.isOpen && isAdmin && (
            <LessonFormModal
               isEdit={Boolean(lessonForm.selectedLesson)}
               mode={lessonForm.mode}
               form={lessonForm.form}
               error={lessonForm.error}
               initialTeacherName={lessonForm.initialTeacherName}
               onModeChange={lessonForm.setMode}
               onFormChange={lessonForm.setForm}
               onClose={lessonForm.closeForm}
               onSubmit={lessonForm.submitForm}
            />
         )}
      </div>
   )
}
