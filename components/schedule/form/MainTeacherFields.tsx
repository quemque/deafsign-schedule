'use client'

import { Plus, X } from 'lucide-react'
import { getMainTeachersList } from '@/utils/lessonForm'

interface MainTeacherFieldsProps {
   customTeacherName: string
   onAdd: () => void
   onUpdate: (index: number, value: string) => void
   onRemove: (index: number) => void
}

export function MainTeacherFields({
   customTeacherName,
   onAdd,
   onUpdate,
   onRemove,
}: MainTeacherFieldsProps) {
   const teachers = getMainTeachersList(customTeacherName)

   return (
      <div>
         <label className="text-[10px] font-medium text-[#8B857D] mb-1 block pl-1">
            Основной преподаватель
         </label>

         <div className="space-y-1.5">
            {teachers.map((teacher, index) => (
               <div key={index} className="flex items-center gap-1.5">
                  <input
                     type="text"
                     placeholder={
                        index === 0
                           ? 'ФИО преподавателя'
                           : 'Дополнительный преподаватель'
                     }
                     value={teacher}
                     onChange={(e) => onUpdate(index, e.target.value)}
                     className="flex-1 min-w-0 bg-[#F5F2ED]/70 focus:bg-white border border-[#E5E0D8] focus:border-[#8BA888] focus:outline-none transition-colors rounded-xl px-4 py-2 sm:py-2.5 text-[11px] sm:text-sm"
                  />

                  {index === 0 ? (
                     <button
                        type="button"
                        onClick={onAdd}
                        className="p-2 sm:p-2.5 rounded-xl bg-[#F5F2ED] border border-[#E5E0D8] hover:bg-[#EDE8E0] text-[#8BA888] hover:text-[#7A9A77] transition-colors shrink-0"
                        title="Добавить преподавателя"
                        aria-label="Добавить преподавателя"
                     >
                        <Plus className="w-4 h-4" />
                     </button>
                  ) : (
                     <button
                        type="button"
                        onClick={() => onRemove(index)}
                        className="p-2 sm:p-2.5 rounded-xl bg-[#F5F2ED] border border-[#E5E0D8] hover:bg-red-50 text-[#8B857D] hover:text-red-500 transition-colors shrink-0"
                        title="Удалить преподавателя"
                        aria-label="Удалить преподавателя"
                     >
                        <X className="w-4 h-4" />
                     </button>
                  )}
               </div>
            ))}
         </div>
      </div>
   )
}
