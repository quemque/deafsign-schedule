'use client'

import { useScheduleData } from '@/hooks/useScheduleData'
import { ScheduleHeader } from '@/components/schedule/ScheduleHeader'
import { ScheduleSubHeader } from '@/components/schedule/ScheduleSubHeader'
import { ScheduleGrid } from '@/components/schedule/ScheduleGrid'
import { LessonDetailsModal } from '@/components/schedule/LessonDetailsModal'
import { LessonFormModal } from '@/components/schedule/form/LessonFormModal'
import { DeleteLessonConfirmModal } from '@/components/schedule/DeleteLessonConfirmModal'
import { RescheduleModal } from '@/components/schedule/RescheduleModal'
import { LoadingState } from '@/components/ui/LoadingState'

export default function SchedulePage() {
   const {
      user,
      loading,
      currentTime,
      weekDates,
      currentWeekLabel,
      visibleLessons,
   } = useScheduleData()

   const isAdmin = user?.role === 'ADMIN'

   return (
      <div className="h-[100dvh] bg-[#FAF8F5] text-[#3E3A35] font-sans antialiased flex flex-col selection:bg-[#8BA888] selection:text-white overflow-hidden">
         <ScheduleHeader isAdmin={isAdmin} />

         <ScheduleSubHeader
            currentWeekLabel={currentWeekLabel}
            weekDates={weekDates}
            isAdmin={isAdmin}
         />

         <main className="flex-1 min-h-0 w-full max-w-[1600px] mx-auto p-1.5 sm:p-2.5 flex flex-col">
            {loading ? (
               <LoadingState variant="full" />
            ) : (
               <ScheduleGrid
                  weekDates={weekDates}
                  currentTime={currentTime}
                  visibleLessons={visibleLessons}
               />
            )}
         </main>

         <LessonDetailsModal />
         <LessonFormModal />
         <DeleteLessonConfirmModal />
         <RescheduleModal />
      </div>
   )
}
