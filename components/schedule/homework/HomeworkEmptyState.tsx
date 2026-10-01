'use client'

import { BookOpen, Plus } from 'lucide-react'

interface EmptyStateProps {
   canEdit: boolean
   onStartCreate: () => void
}

export function HomeworkEmptyState({
   canEdit,
   onStartCreate,
}: EmptyStateProps) {
   return (
      <div className="py-10 flex flex-col items-center justify-center text-center gap-3">
         <div className="w-10 h-10 rounded-2xl bg-[#FAF8F5] border border-[#E5E0D8] text-[#8B857D] flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
         </div>
         <div>
            <h4 className="text-xs font-bold text-[#3E3A35]">
               Домашние задания не добавлены
            </h4>
            <p className="text-[11px] text-[#8B857D] mt-0.5">
               Материалы к этому занятию пока отсутствуют
            </p>
         </div>
         {canEdit && (
            <button
               type="button"
               onClick={onStartCreate}
               className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#8BA888] text-white hover:bg-[#7A9A77] shadow-xs"
            >
               <Plus className="w-4 h-4" />
               <span>Создать первое задание</span>
            </button>
         )}
      </div>
   )
}
