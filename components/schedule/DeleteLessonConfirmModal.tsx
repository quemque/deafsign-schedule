'use client'

import { AlertTriangle, X } from 'lucide-react'

import type { DeleteLessonMode } from '@/types/schedule'
import { formatDayMonth } from '@/utils/date'

interface DeleteLessonConfirmModalProps {
   isOpen: boolean
   isRecurring: boolean
   date: Date
   onClose: () => void
   onConfirm: (mode: DeleteLessonMode) => void
}

interface ModalHeaderProps {
   onClose: () => void
}

interface ModalDescriptionProps {
   isRecurring: boolean
   formattedDate: string
}

interface RecurringActionsProps {
   formattedDate: string
   onConfirm: (mode: DeleteLessonMode) => void
}

interface SingleActionProps {
   onConfirm: (mode: DeleteLessonMode) => void
}

interface CancelButtonProps {
   onClick: () => void
}

function ModalHeader({ onClose }: ModalHeaderProps) {
   return (
      <div className="flex items-center justify-between mb-4">
         <div className="flex items-center gap-3 text-[#C25E5E]">
            <div className="p-2.5 rounded-xl bg-red-50">
               <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#3E3A35]">
               Удаление занятия
            </h3>
         </div>

         <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#F5F2ED] text-[#8B857D] transition-colors"
            aria-label="Закрыть"
         >
            <X className="w-4 h-4" />
         </button>
      </div>
   )
}

function ModalDescription({
   isRecurring,
   formattedDate,
}: ModalDescriptionProps) {
   const message = isRecurring
      ? `Это занятие повторяется. Как именно вы хотите его удалить для даты ${formattedDate}?`
      : 'Вы действительно хотите удалить это занятие?'

   return (
      <p className="text-xs text-[#8B857D] mb-5 leading-relaxed">{message}</p>
   )
}

function RecurringActions({ formattedDate, onConfirm }: RecurringActionsProps) {
   return (
      <>
         <button
            type="button"
            onClick={() => onConfirm('this')}
            className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl bg-[#F5F2ED] hover:bg-[#EDE8E0] text-[#3E3A35] transition-colors"
         >
            Только это занятие ({formattedDate})
         </button>

         <button
            type="button"
            onClick={() => onConfirm('future')}
            className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl bg-[#F5F2ED] hover:bg-[#EDE8E0] text-[#3E3A35] transition-colors"
         >
            Это и все последующие
         </button>

         <button
            type="button"
            onClick={() => onConfirm('all')}
            className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
         >
            Удалить всю серию целиком
         </button>
      </>
   )
}

function SingleAction({ onConfirm }: SingleActionProps) {
   return (
      <button
         type="button"
         onClick={() => onConfirm('all')}
         className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl bg-red-500 hover:bg-red-600 text-white transition-colors"
      >
         Удалить
      </button>
   )
}

function CancelButton({ onClick }: CancelButtonProps) {
   return (
      <button
         type="button"
         onClick={onClick}
         className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl border border-[#E5E0D8] text-[#8B857D] hover:bg-gray-50 transition-colors"
      >
         Отмена
      </button>
   )
}

export function DeleteLessonConfirmModal({
   isOpen,
   isRecurring,
   date,
   onClose,
   onConfirm,
}: DeleteLessonConfirmModalProps) {
   if (!isOpen) return null

   const formattedDate = formatDayMonth(date)

   return (
      <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-[#2C2824]/50 backdrop-blur-xs animate-in fade-in">
         <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-[#E5E0D8] shadow-2xl relative">
            <ModalHeader onClose={onClose} />

            <ModalDescription
               isRecurring={isRecurring}
               formattedDate={formattedDate}
            />

            <div className="flex flex-col gap-2">
               {isRecurring ? (
                  <RecurringActions
                     formattedDate={formattedDate}
                     onConfirm={onConfirm}
                  />
               ) : (
                  <SingleAction onConfirm={onConfirm} />
               )}

               <CancelButton onClick={onClose} />
            </div>
         </div>
      </div>
   )
}
