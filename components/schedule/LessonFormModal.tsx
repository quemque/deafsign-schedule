'use client'

import { useState } from 'react'
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
   initialTeacherName?: string
   onModeChange: (mode: 'once' | 'weekly') => void
   onFormChange: (form: FormDataState) => void
   onClose: () => void
   onSubmit: (e: React.FormEvent, teacherScope?: 'this' | 'all') => void
}

export function LessonFormModal({
   isEdit,
   mode,
   form,
   error,
   initialTeacherName = '',
   onModeChange,
   onFormChange,
   onClose,
   onSubmit,
}: LessonFormModalProps) {
   const [showTeacherScopeModal, setShowTeacherScopeModal] = useState(false)

   const handleDateChange = (newDateStr: string) => {
      if (!newDateStr) {
         onFormChange({ ...form, date: newDateStr })
         return
      }
      const [y, m, d] = newDateStr.split('-').map(Number)
      const selected = new Date(y, m - 1, d)
      const computedDay = INDEX_TO_DAY[selected.getDay()]

      const currentDays = form.daysOfWeek || []
      const nextDays = currentDays.includes(computedDay)
         ? currentDays
         : [...currentDays, computedDay]

      onFormChange({
         ...form,
         date: newDateStr,
         dayOfWeek: computedDay,
         daysOfWeek: nextDays.length > 0 ? nextDays : [computedDay],
      })
   }

   const toggleDayOfWeek = (dayKey: string) => {
      const currentDays = form.daysOfWeek || []
      let nextDays: string[]
      const updatedTeacherByDay = { ...(form.teacherByDay || {}) }
      const updatedTimeByDay = { ...(form.timeByDay || {}) }

      if (currentDays.includes(dayKey)) {
         if (currentDays.length === 1) return
         nextDays = currentDays.filter((d) => d !== dayKey)
         delete updatedTeacherByDay[dayKey]
         delete updatedTimeByDay[dayKey]
      } else {
         nextDays = [...currentDays, dayKey]
      }

      onFormChange({
         ...form,
         daysOfWeek: nextDays,
         dayOfWeek: nextDays[0] || dayKey,
         teacherByDay: updatedTeacherByDay,
         timeByDay: updatedTimeByDay,
      })
   }

   const handleDayTeacherChange = (dayKey: string, value: string) => {
      onFormChange({
         ...form,
         teacherByDay: {
            ...(form.teacherByDay || {}),
            [dayKey]: value,
         },
      })
   }

   const handleDayTimeChange = (
      dayKey: string,
      field: 'startTime' | 'endTime',
      value: string,
   ) => {
      const currentSlot = form.timeByDay?.[dayKey] || {
         startTime: form.startTime,
         endTime: form.endTime,
      }
      onFormChange({
         ...form,
         timeByDay: {
            ...(form.timeByDay || {}),
            [dayKey]: {
               ...currentSlot,
               [field]: value,
            },
         },
      })
   }

   const handleFormSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      if (
         isEdit &&
         mode === 'weekly' &&
         form.customTeacherName.trim() !== initialTeacherName.trim()
      ) {
         setShowTeacherScopeModal(true)
         return
      }
      onSubmit(e, 'all')
   }

   return (
      <>
         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#2C2824]/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl shadow-2xl border border-[#E5E0D8] w-full max-w-lg max-h-[90dvh] flex flex-col overflow-hidden">
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
                     onSubmit={handleFormSubmit}
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
                           Основной преподаватель
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

                     {(mode === 'weekly' || isEdit) && (
                        <div>
                           <label className="text-[10px] font-medium text-[#8B857D] mb-1.5 block pl-1">
                              Дни недели курса
                           </label>
                           <div className="flex gap-1.5 flex-wrap">
                              {DAYS_OF_WEEK.map((d) => {
                                 const isSelected = (
                                    form.daysOfWeek || []
                                 ).includes(d.key)
                                 return (
                                    <button
                                       key={d.key}
                                       type="button"
                                       onClick={() => toggleDayOfWeek(d.key)}
                                       className={`flex-1 min-w-[40px] py-2 text-[11px] sm:text-xs font-semibold rounded-xl border transition-all ${
                                          isSelected
                                             ? 'bg-[#8BA888] text-white border-[#8BA888] shadow-sm shadow-[#8BA888]/20'
                                             : 'bg-[#F5F2ED] text-[#5A534A] border-[#E5E0D8] hover:bg-[#EDE8E0]'
                                       }`}
                                    >
                                       {d.short}
                                    </button>
                                 )
                              })}
                           </div>
                        </div>
                     )}

                     <div className="grid grid-cols-2 gap-3">
                        <div>
                           <label className="text-[10px] font-medium text-[#8B857D] mb-1 block pl-1">
                              {mode === 'weekly'
                                 ? 'Начало (по умолчанию)'
                                 : 'Начало'}
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
                              {mode === 'weekly'
                                 ? 'Конец (по умолчанию)'
                                 : 'Конец'}
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

                     {(mode === 'weekly' || isEdit) &&
                        (form.daysOfWeek || []).length > 0 && (
                           <div className="pt-1">
                              <label className="text-[10px] font-medium text-[#8B857D] mb-1 block pl-1">
                                 Настройки по отдельным дням (опционально)
                              </label>
                              <div className="space-y-2 bg-[#FAF8F5] p-3 rounded-xl border border-[#E5E0D8]">
                                 {(form.daysOfWeek || []).map((dayKey) => {
                                    const dayObj = DAYS_OF_WEEK.find(
                                       (d) => d.key === dayKey,
                                    )
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
                                             value={
                                                form.teacherByDay?.[dayKey] ||
                                                ''
                                             }
                                             onChange={(e) =>
                                                handleDayTeacherChange(
                                                   dayKey,
                                                   e.target.value,
                                                )
                                             }
                                             className="flex-1 min-w-0 bg-white border border-[#E5E0D8] focus:border-[#8BA888] focus:outline-none transition-colors rounded-lg px-2 py-1 text-[11px]"
                                          />
                                          <div className="flex items-center gap-1 shrink-0">
                                             <input
                                                type="time"
                                                value={
                                                   currentSlot?.startTime || ''
                                                }
                                                placeholder={form.startTime}
                                                onChange={(e) =>
                                                   handleDayTimeChange(
                                                      dayKey,
                                                      'startTime',
                                                      e.target.value,
                                                   )
                                                }
                                                className="w-20 bg-white border border-[#E5E0D8] focus:border-[#8BA888] focus:outline-none transition-colors rounded-lg px-1.5 py-1 text-[11px]"
                                             />
                                             <span className="text-[10px] text-[#8B857D]">
                                                –
                                             </span>
                                             <input
                                                type="time"
                                                value={
                                                   currentSlot?.endTime || ''
                                                }
                                                placeholder={form.endTime}
                                                onChange={(e) =>
                                                   handleDayTimeChange(
                                                      dayKey,
                                                      'endTime',
                                                      e.target.value,
                                                   )
                                                }
                                                className="w-20 bg-white border border-[#E5E0D8] focus:border-[#8BA888] focus:outline-none transition-colors rounded-lg px-1.5 py-1 text-[11px]"
                                             />
                                          </div>
                                       </div>
                                    )
                                 })}
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

         {showTeacherScopeModal && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-[#2C2824]/50 backdrop-blur-xs animate-in fade-in">
               <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-[#E5E0D8] shadow-2xl relative">
                  <h3 className="font-bold text-base text-[#3E3A35] mb-2">
                     Изменение преподавателя
                  </h3>
                  <p className="text-xs text-[#8B857D] mb-5 leading-relaxed">
                     Применить нового преподавателя только для выбранного дня
                     или для всех занятий курса?
                  </p>
                  <div className="flex flex-col gap-2">
                     <button
                        type="button"
                        onClick={(e) => {
                           setShowTeacherScopeModal(false)
                           onSubmit(e, 'this')
                        }}
                        className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl bg-[#F5F2ED] hover:bg-[#EDE8E0] text-[#3E3A35] transition-colors"
                     >
                        Только на это занятие
                     </button>
                     <button
                        type="button"
                        onClick={(e) => {
                           setShowTeacherScopeModal(false)
                           onSubmit(e, 'all')
                        }}
                        className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl bg-[#8BA888] hover:bg-[#7A9A77] text-white shadow-sm shadow-[#8BA888]/20 transition-colors"
                     >
                        На все занятия курса
                     </button>
                     <button
                        type="button"
                        onClick={() => setShowTeacherScopeModal(false)}
                        className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl border border-[#E5E0D8] text-[#8B857D] hover:bg-gray-50 transition-colors"
                     >
                        Отмена
                     </button>
                  </div>
               </div>
            </div>
         )}
      </>
   )
}
