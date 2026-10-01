'use client'

import { Edit, Trash2, CalendarClock } from 'lucide-react'

interface FooterProps {
   isAdmin: boolean
   baseColor: string
   onDelete: () => void
   onOpenReschedule: () => void
   onEdit: () => void
   onClose: () => void
}

export function LessonDetailsFooter({
   isAdmin,
   baseColor,
   onDelete,
   onOpenReschedule,
   onEdit,
   onClose,
}: FooterProps) {
   return (
      <div className="p-3 sm:p-4 border-t border-[#F0EDE8] bg-[#FDFCFB] shrink-0 flex items-center justify-between gap-2">
         {isAdmin ? (
            <div className="flex gap-1.5 w-auto">
               <button
                  type="button"
                  onClick={onDelete}
                  className="flex justify-center p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
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
