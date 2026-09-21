'use client'

import type { FormDataState } from '@/types/schedule'
import { DAYS_OF_WEEK } from '@/constants/schedule'

interface DayOverridesListProps {
   daysOfWeek: string[]
   form: FormDataState
   onTeacherChange: (dayKey: string, value: string) => void
   onTimeChange: (
      dayKey: string,
      field: 'startTime' | 'endTime',
      value: string,
   ) => void
}

export function DayOverridesList({
   daysOfWeek,
   form,
   onTeacherChange,
   onTimeChange,
}: DayOverridesListProps) {
   if (daysOfWeek.length === 0) return null

   return (
      <div className="pt-1">
         <label className="text-[10px] font-medium text-[#8B857D] mb-1 block pl-1">
            Настройки по отдельным дням (опционально)
         </label>

         <div className="space-y-2 bg-[#FAF8F5] p-3 rounded-xl border border-[#E5E0D8]">
            {daysOfWeek.map((dayKey) => {
               const dayObj = DAYS_OF_WEEK.find((d) => d.key === dayKey)
               const currentSlot = form.timeByDay?.[dayKey]

               return (
                  <div
                     key={dayKey}
                     className="flex flex-col sm:flex-row sm:items-center gap-2 pb-2 border-b border-[#E5E0D8]/60 last:border-b-0 last:pb-0"
                  >
                     <span className="w-7 shrink-0 text-[10px] font-bold text-[#5A534A]">
                        {dayObj?.short}
                     </span>

                     <input
                        type="text"
                        placeholder="Преподаватель"
                        value={form.teacherByDay?.[dayKey] || ''}
                        onChange={(e) =>
                           onTeacherChange(dayKey, e.target.value)
                        }
                        className="flex-1 min-w-0 bg-white border border-[#E5E0D8] focus:border-[#8BA888] focus:outline-none transition-colors rounded-lg px-2 py-1 text-[11px]"
                     />

                     <div className="flex items-center gap-1 shrink-0">
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
