'use client'

import { useScheduleData } from '@/hooks/useScheduleData'
import { ScheduleHeader } from '@/components/schedule/calendar/ScheduleHeader'
import { ScheduleSubHeader } from '@/components/schedule/calendar/ScheduleSubHeader'
import { ScheduleGrid } from '@/components/schedule/calendar/ScheduleGrid'
import { LessonDetailsModal } from '@/components/schedule/LessonDetailsModal'
import { LessonFormModal } from '@/components/schedule/form/LessonFormModal'
import { DeleteLessonConfirmModal } from '@/components/schedule/modal/DeleteLessonConfirmModal'
import { RescheduleModal } from '@/components/schedule/modal/RescheduleModal'
import { LoadingState } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'

export default function SchedulePage() {
   const {
      user,
      loading,
      isFetching,
      error,
      refetch,
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

         <main className="relative flex-1 min-h-0 w-full max-w-[1600px] mx-auto p-1.5 sm:p-2.5 flex flex-col">
            {isFetching && !loading && (
               <div className="absolute top-0 left-0 right-0 h-1 bg-[#8BA888]/20 overflow-hidden z-30 rounded-t-xl">
                  <div className="h-full bg-[#8BA888] animate-pulse w-full" />
               </div>
            )}

            {loading ? (
               <LoadingState variant="full" />
            ) : error ? (
               <ErrorState message={error} onRetry={() => refetch()} />
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
