'use client'

import { X, Check } from 'lucide-react'
import { DAYS_OF_WEEK } from '@/constants/schedule'
import type { FormDataState } from '@/types/schedule'

const PALETTE = [
   { label: 'Мятный', value: '#8BA888' },
   { label: 'Коралловый', value: '#E07A5F' },
   { label: 'Синий', value: '#457B9D' },
   { label: 'Охра', value: '#D4A373' },
   { label: 'Фиолетовый', value: '#9B5DE5' },
   { label: 'Графитовый', value: '#6C757D' },
]

const DAY_INDICES: Record<string, number> = {
   SUNDAY: 0,
   MONDAY: 1,
   TUESDAY: 2,
   WEDNESDAY: 3,
   THURSDAY: 4,
   FRIDAY: 5,
   SATURDAY: 6,
}

const INDEX_TO_DAY = [
   'SUNDAY',
   'MONDAY',
   'TUESDAY',
   'WEDNESDAY',
   'THURSDAY',
   'FRIDAY',
   'SATURDAY',
]

interface LessonFormModalProps {
   isEdit: boolean
   mode: 'once' | 'weekly'
   form: FormDataState
   error: string
   onModeChange: (mode: 'once' | 'weekly') => void
   onFormChange: (form: FormDataState) => void
   onClose: () => void
   onSubmit: (e: React.FormEvent) => void
}

export function LessonFormModal({
   isEdit,
   mode,
   form,
   error,
   onModeChange,
   onFormChange,
   onClose,
   onSubmit,
}: LessonFormModalProps) {
   const handleDateChange = (newDateStr: string) => {
      if (!newDateStr) {
         onFormChange({ ...form, date: newDateStr })
         return
      }
      const [y, m, d] = newDateStr.split('-').map(Number)
      const selected = new Date(y, m - 1, d)
      const computedDay = INDEX_TO_DAY[selected.getDay()]
      onFormChange({
         ...form,
         date: newDateStr,
         dayOfWeek: computedDay,
      })
   }

   const handleDayOfWeekChange = (newDayKey: string) => {
      if (!form.date) {
         onFormChange({ ...form, dayOfWeek: newDayKey })
         return
      }
      const targetDay = DAY_INDICES[newDayKey]
      const [y, m, d] = form.date.split('-').map(Number)
      const current = new Date(y, m - 1, d)
      const currentDay = current.getDay()
      let diff = targetDay - currentDay
      if (diff < 0) diff += 7
      current.setDate(current.getDate() + diff)

      const ny = current.getFullYear()
      const nm = String(current.getMonth() + 1).padStart(2, '0')
      const nd = String(current.getDate()).padStart(2, '0')

      onFormChange({
         ...form,
         dayOfWeek: newDayKey,
         date: `${ny}-${nm}-${nd}`,
      })
   }

   return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#2C2824]/40 backdrop-blur-xs">
         <div className="bg-white rounded-2xl shadow-2xl border border-[#E5E0D8] w-full max-w-md max-h-[90dvh] flex flex-col overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-[#E5E0D8] flex items-center justify-between shrink-0">
               <h3 className="text-lg font-bold text-[#3E3A35]">
                  {isEdit ? 'Редактирование' : 'Новое занятие'}
               </h3>
               <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-[#F5F2ED] transition-colors text-[#8B857D]"
               >
                  <X className="w-4 h-4" />
               </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1">
               {!isEdit && (
                  <div className="flex gap-2 mb-5">
                     <button
                        type="button"
                        onClick={() => onModeChange('once')}
                        className={`flex-1 py-2 text-[11px] sm:text-xs font-semibold rounded-xl border transition-all ${
                           mode === 'once'
                              ? 'bg-[#8BA888] text-white border-[#8BA888] shadow-sm shadow-[#8BA888]/20'
                              : 'bg-[#F5F2ED] text-[#5A534A] border-[#E5E0D8] hover:bg-[#EDE8E0]'
                        }`}
                     >
                        Разовое
                     </button>
                     <button
                        type="button"
                        onClick={() => onModeChange('weekly')}
                        className={`flex-1 py-2 text-[11px] sm:text-xs font-semibold rounded-xl border transition-all ${
                           mode === 'weekly'
                              ? 'bg-[#8BA888] text-white border-[#8BA888] shadow-sm shadow-[#8BA888]/20'
                              : 'bg-[#F5F2ED] text-[#5A534A] border-[#E5E0D8] hover:bg-[#EDE8E0]'
                        }`}
                     >
                        Каждую неделю
                     </button>
                  </div>
               )}

               <form
                  id="lesson-form"
                  onSubmit={onSubmit}
                  className="space-y-3 sm:space-y-4"
               >
                  <div>
                     <label className="text-[10px] font-medium text-[#8B857D] mb-1.5 block pl-1">
                        Цвет занятия
                     </label>
                     <div className="flex items-center gap-2.5">
                        {PALETTE.map((c) => (
                           <button
                              key={c.value}
                              type="button"
                              onClick={() =>
                                 onFormChange({ ...form, color: c.value })
                              }
                              style={{ backgroundColor: c.value }}
                              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                                 form.color === c.value
                                    ? 'ring-2 ring-offset-2 ring-[#3E3A35] scale-110'
                                    : 'hover:scale-105'
                              }`}
                           >
                              {form.color === c.value && (
                                 <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                              )}
                           </button>
                        ))}
                     </div>
                  </div>

                  <div>
                     <label className="text-[10px] font-medium text-[#8B857D] mb-1 block pl-1">
                        Предмет / Группа
                     </label>
                     <input
                        type="text"
                        placeholder="Например: Основы жестового языка"
                        value={form.subject}
                        onChange={(e) =>
                           onFormChange({ ...form, subject: e.target.value })
                        }
                        required
                        className="w-full bg-[#F5F2ED]/70 focus:bg-white border border-[#E5E0D8] focus:border-[#8BA888] focus:outline-none transition-colors rounded-xl px-4 py-2 sm:py-2.5 text-[11px] sm:text-sm"
                     />
                  </div>

                  <div>
                     <label className="text-[10px] font-medium text-[#8B857D] mb-1 block pl-1">
                        Преподаватель
                     </label>
                     <input
                        type="text"
                        placeholder="ФИО преподавателя"
                        value={form.customTeacherName}
                        onChange={(e) =>
                           onFormChange({
                              ...form,
                              customTeacherName: e.target.value,
                           })
                        }
                        className="w-full bg-[#F5F2ED]/70 focus:bg-white border border-[#E5E0D8] focus:border-[#8BA888] focus:outline-none transition-colors rounded-xl px-4 py-2 sm:py-2.5 text-[11px] sm:text-sm"
                     />
                  </div>

                  {(mode === 'weekly' || isEdit) && (
                     <div>
                        <label className="text-[10px] font-medium text-[#8B857D] mb-1 block pl-1">
                           Количество занятий в курсе (опционально)
                        </label>
                        <input
                           type="number"
                           min="1"
                           placeholder="Например: 25 (пусто = бессрочно)"
                           value={form.totalLessons}
                           onChange={(e) =>
                              onFormChange({
                                 ...form,
                                 totalLessons: e.target.value,
                              })
                           }
                           className="w-full bg-[#F5F2ED]/70 focus:bg-white border border-[#E5E0D8] focus:border-[#8BA888] focus:outline-none transition-colors rounded-xl px-4 py-2 sm:py-2.5 text-[11px] sm:text-sm"
                        />
                     </div>
                  )}

                  {!isEdit && (
                     <div>
                        <label className="text-[10px] font-medium text-[#8B857D] mb-1 block pl-1">
                           {mode === 'weekly'
                              ? 'Дата начала курса'
                              : 'Дата занятия'}
                        </label>
                        <input
                           type="date"
                           value={form.date}
                           onChange={(e) => handleDateChange(e.target.value)}
                           required
                           className="w-full bg-[#F5F2ED]/70 focus:bg-white border border-[#E5E0D8] focus:border-[#8BA888] focus:outline-none transition-colors rounded-xl px-4 py-2 sm:py-2.5 text-[11px] sm:text-sm"
                        />
                     </div>
                  )}

                  {!isEdit && mode === 'weekly' && (
                     <div>
                        <label className="text-[10px] font-medium text-[#8B857D] mb-1 block pl-1">
                           День недели
                        </label>
                        <select
                           value={form.dayOfWeek}
                           onChange={(e) =>
                              handleDayOfWeekChange(e.target.value)
                           }
                           className="w-full bg-[#F5F2ED]/70 focus:bg-white border border-[#E5E0D8] focus:border-[#8BA888] focus:outline-none transition-colors rounded-xl px-4 py-2 sm:py-2.5 text-[11px] sm:text-sm appearance-none"
                        >
                           {DAYS_OF_WEEK.map((d) => (
                              <option key={d.key} value={d.key}>
                                 {d.label}
                              </option>
                           ))}
                        </select>
                     </div>
                  )}

                  {!isEdit && (
                     <div className="grid grid-cols-2 gap-3">
                        <div>
                           <label className="text-[10px] font-medium text-[#8B857D] mb-1 block pl-1">
                              Начало
                           </label>
                           <input
                              type="time"
                              value={form.startTime}
                              onChange={(e) =>
                                 onFormChange({
                                    ...form,
                                    startTime: e.target.value,
                                 })
                              }
                              required
                              className="w-full bg-[#F5F2ED]/70 focus:bg-white border border-[#E5E0D8] focus:border-[#8BA888] focus:outline-none transition-colors rounded-xl px-3 py-2 sm:py-2.5 text-[11px] sm:text-sm"
                           />
                        </div>
                        <div>
                           <label className="text-[10px] font-medium text-[#8B857D] mb-1 block pl-1">
                              Конец
                           </label>
                           <input
                              type="time"
                              value={form.endTime}
                              onChange={(e) =>
                                 onFormChange({
                                    ...form,
                                    endTime: e.target.value,
                                 })
                              }
                              required
                              className="w-full bg-[#F5F2ED]/70 focus:bg-white border border-[#E5E0D8] focus:border-[#8BA888] focus:outline-none transition-colors rounded-xl px-3 py-2 sm:py-2.5 text-[11px] sm:text-sm"
                           />
                        </div>
                     </div>
                  )}

                  {error && (
                     <div className="p-3 rounded-xl bg-red-50 text-[11px] text-red-700 font-medium border border-red-100">
                        {error}
                     </div>
                  )}
               </form>
            </div>

            <div className="p-4 sm:p-6 border-t border-[#F0EDE8] bg-[#FDFCFB] shrink-0 flex gap-3">
               <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 sm:py-3 text-[11px] sm:text-xs font-semibold bg-[#F5F2ED] hover:bg-[#EDE8E0] text-[#3E3A35] transition-colors rounded-xl"
               >
                  Отмена
               </button>
               <button
                  form="lesson-form"
                  type="submit"
                  className="flex-1 py-2.5 sm:py-3 text-[11px] sm:text-xs font-semibold bg-[#8BA888] hover:bg-[#7A9A77] text-white shadow-sm shadow-[#8BA888]/20 transition-all rounded-xl"
               >
                  Сохранить
               </button>
            </div>
         </div>
      </div>
   )
}
