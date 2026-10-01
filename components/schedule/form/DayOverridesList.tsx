'use client'

import { Plus, X } from 'lucide-react'
import { DAYS_OF_WEEK } from '@/constants/schedule'
import type { FormDataState } from '@/types/schedule'
import { getDayTeachersList } from '@/utils/lessonForm'

interface DayOverridesListProps {
   daysOfWeek: string[]
   form: FormDataState
   onAddTeacher: (dayKey: string) => void
   onUpdateTeacher: (dayKey: string, index: number, value: string) => void
   onRemoveTeacher: (dayKey: string, index: number) => void
   onTimeChange: (
      dayKey: string,
      field: 'startTime' | 'endTime',
      value: string,
   ) => void
}

export function DayOverridesList({
   daysOfWeek,
   form,
   onAddTeacher,
   onUpdateTeacher,
   onRemoveTeacher,
   onTimeChange,
}: DayOverridesListProps) {
   if (daysOfWeek.length === 0) return null

   return (
      <div className="pt-1">
         <label className="text-[10px] font-medium text-[#8B857D] mb-1 block pl-1">
            Настройки по отдельным дням (опционально)
         </label>

         <div className="space-y-2.5 bg-[#FAF8F5] p-3 rounded-xl border border-[#E5E0D8]">
            {daysOfWeek.map((dayKey) => {
               const dayObj = DAYS_OF_WEEK.find((d) => d.key === dayKey)
               const currentSlot = form.timeByDay?.[dayKey]
               const teachers = getDayTeachersList(form.teacherByDay, dayKey)

               return (
                  <div
                     key={dayKey}
                     className="flex flex-col sm:flex-row sm:items-start gap-2 pb-2.5 border-b border-[#E5E0D8]/60 last:border-b-0 last:pb-0"
                  >
                     <span className="w-7 shrink-0 text-[10px] font-bold text-[#5A534A] pt-1.5">
                        {dayObj?.short}
                     </span>

                     <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                        {teachers.map((teacherName, index) => (
                           <div
                              key={index}
                              className="flex items-center gap-1.5 w-full"
                           >
                              <input
                                 type="text"
                                 placeholder={
                                    index === 0
                                       ? 'Преподаватель'
                                       : 'Второй преподаватель'
                                 }
                                 value={teacherName}
                                 onChange={(e) =>
                                    onUpdateTeacher(
                                       dayKey,
                                       index,
                                       e.target.value,
                                    )
                                 }
                                 className="flex-1 min-w-0 bg-white border border-[#E5E0D8] focus:border-[#8BA888] focus:outline-none transition-colors rounded-lg px-2 py-1 text-[11px]"
                              />

                              {index === 0 ? (
                                 <button
                                    type="button"
                                    onClick={() => onAddTeacher(dayKey)}
                                    className="p-1 rounded-lg bg-white border border-[#E5E0D8] hover:bg-[#F5F2ED] text-[#8BA888] hover:text-[#7A9A77] transition-colors shrink-0"
                                    title="Добавить ещё преподавателя"
                                    aria-label="Добавить преподавателя"
                                 >
                                    <Plus className="w-3.5 h-3.5" />
                                 </button>
                              ) : (
                                 <button
                                    type="button"
                                    onClick={() =>
                                       onRemoveTeacher(dayKey, index)
                                    }
                                    className="p-1 rounded-lg bg-white border border-[#E5E0D8] hover:bg-red-50 text-[#8B857D] hover:text-red-500 transition-colors shrink-0"
                                    title="Удалить поле"
                                    aria-label="Удалить преподавателя"
                                 >
                                    <X className="w-3.5 h-3.5" />
                                 </button>
                              )}
                           </div>
                        ))}
                     </div>

                     <div className="flex items-center gap-1 shrink-0 pt-0.5 sm:pt-0">
                        <input
                           type="time"
                           value={currentSlot?.startTime || ''}
                           placeholder={form.startTime}
                           onChange={(e) =>
                              onTimeChange(dayKey, 'startTime', e.target.value)
                           }
                           className="w-20 bg-white border border-[#E5E0D8] focus:border-[#8BA888] focus:outline-none transition-colors rounded-lg px-1.5 py-1 text-[11px]"
                        />

                        <span className="text-[10px] text-[#8B857D]">–</span>

                        <input
                           type="time"
                           value={currentSlot?.endTime || ''}
                           placeholder={form.endTime}
                           onChange={(e) =>
                              onTimeChange(dayKey, 'endTime', e.target.value)
                           }
                           className="w-20 bg-white border border-[#E5E0D8] focus:border-[#8BA888] focus:outline-none transition-colors rounded-lg px-1.5 py-1 text-[11px]"
                        />
                     </div>
                  </div>
               )
            })}
         </div>
      </div>
   )
}
