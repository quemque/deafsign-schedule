'use client'

import { useState } from 'react'
import { useModalStore } from '@/stores/useModalStore'
import { useScheduleMutations } from '@/hooks/useScheduleMutations'

export function RescheduleModal() {
   const { rescheduleModal, closeReschedule, closeDetails } = useModalStore()
   const { rescheduleLesson } = useScheduleMutations()

   const { isOpen, lessonId, dateKey, initialStartTime, initialEndTime } =
      rescheduleModal

   const [rescheduleDate, setRescheduleDate] = useState(dateKey)
   const [startTime, setStartTime] = useState(initialStartTime)
   const [endTime, setEndTime] = useState(initialEndTime)
   const [error, setError] = useState('')
   const [isSubmitting, setIsSubmitting] = useState(false)

   if (!isOpen || !lessonId) return null

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setError('')
      setIsSubmitting(true)

      try {
         await rescheduleLesson({
            id: lessonId,
            payload: {
               originalDate: dateKey,
               newDate: rescheduleDate,
               newStartTime: startTime,
               newEndTime: endTime,
            },
         })
         closeReschedule()
         closeDetails()
      } catch (err: unknown) {
         setError(
            err instanceof Error ? err.message : 'Ошибка при переносе занятия',
         )
      } finally {
         setIsSubmitting(false)
      }
   }

   return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-[#2C2824]/50 backdrop-blur-xs animate-in fade-in">
         <div className="bg-white rounded-2xl p-4 sm:p-6 max-w-sm w-full border border-[#E5E0D8] shadow-2xl relative">
            <h3 className="font-bold text-sm sm:text-base text-[#3E3A35] mb-1.5">
               Перенос занятия
            </h3>
            <p className="text-xs text-[#8B857D] mb-3">
               Новая дата и время для занятия с{' '}
               <span className="font-bold text-[#3E3A35]">{dateKey}</span>.
            </p>

            <form onSubmit={handleSubmit} className="space-y-2.5">
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
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
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
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        required
                        className="w-full bg-[#F5F2ED]/70 focus:bg-white border border-[#E5E0D8] focus:border-[#8BA888] focus:outline-none transition-colors rounded-xl px-2.5 py-1.5 text-xs"
                     />
                  </div>
               </div>

               {error && (
                  <div className="p-2 rounded-lg bg-red-50 text-[10px] text-red-600 border border-red-100">
                     {error}
                  </div>
               )}

               <div className="pt-2 flex gap-2">
                  <button
                     type="button"
                     disabled={isSubmitting}
                     onClick={closeReschedule}
                     className="flex-1 py-2 text-xs font-semibold rounded-xl bg-[#F5F2ED] hover:bg-[#EDE8E0] text-[#3E3A35] transition-colors"
                  >
                     Отмена
                  </button>
                  <button
                     type="submit"
                     disabled={isSubmitting}
                     className="flex-1 py-2 text-xs font-semibold rounded-xl bg-[#8BA888] hover:bg-[#7A9A77] text-white shadow-sm shadow-[#8BA888]/20 transition-colors disabled:opacity-50"
                  >
                     {isSubmitting ? 'Сохранение...' : 'Перенести'}
                  </button>
               </div>
            </form>
         </div>
      </div>
   )
}
