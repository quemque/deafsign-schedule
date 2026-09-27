'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { DAYS_OF_WEEK } from '@/constants/schedule'
import { ColorPicker } from './ColorPicker'
import { DayOverridesList } from './DayOverridesList'
import { TeacherScopeModal } from './TeacherScopeModal'
import { MainTeacherFields } from './MainTeacherFields'
import { useLessonForm } from '@/hooks/useLessonForm'
import {
   addDayTeacher,
   addMainTeacher,
   removeDayTeacher,
   removeMainTeacher,
   toggleFormDayOfWeek,
   updateDayTeacher,
   updateDayTime,
   updateFormDate,
   updateMainTeacher,
} from '@/utils/lessonForm'

interface ModeSelectorProps {
   mode: 'once' | 'weekly'
   onModeChange: (mode: 'once' | 'weekly') => void
}

function ModeSelector({ mode, onModeChange }: ModeSelectorProps) {
   const getButtonClassName = (active: boolean) =>
      `flex-1 py-2 text-[11px] sm:text-xs font-semibold rounded-xl border transition-all ${
         active
            ? 'bg-[#8BA888] text-white border-[#8BA888] shadow-sm shadow-[#8BA888]/20'
            : 'bg-[#F5F2ED] text-[#5A534A] border-[#E5E0D8] hover:bg-[#EDE8E0]'
      }`

   return (
      <div className="flex gap-2 mb-5">
         <button
            type="button"
            onClick={() => onModeChange('once')}
            className={getButtonClassName(mode === 'once')}
         >
            Разовое
         </button>
         <button
            type="button"
            onClick={() => onModeChange('weekly')}
            className={getButtonClassName(mode === 'weekly')}
         >
            Каждую неделю
         </button>
      </div>
   )
}

export function LessonFormModal() {
   const {
      isOpen,
      isEdit,
      mode,
      setMode,
      form,
      setForm,
      initialTeacherName,
      error,
      closeForm,
      submitForm,
   } = useLessonForm()

   const [showTeacherScopeModal, setShowTeacherScopeModal] = useState(false)

   if (!isOpen) return null

   const isRecurringMode = mode === 'weekly' || isEdit

   const handleFormSubmit = (e: React.FormEvent) => {
      e.preventDefault()

      const currentTeacher = String(form.customTeacherName || '').trim()
      const initialTeacher = String(initialTeacherName || '').trim()
      const hasTeacherChanged = currentTeacher !== initialTeacher

      if (isEdit && mode === 'weekly' && hasTeacherChanged) {
         setShowTeacherScopeModal(true)
         return
      }

      submitForm(e, 'all')
   }

   const handleScopeConfirm = (scope: 'this' | 'all') => {
      setShowTeacherScopeModal(false)
      submitForm({ preventDefault: () => {} } as React.FormEvent, scope)
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
                     type="button"
                     onClick={closeForm}
                     className="p-1.5 rounded-lg hover:bg-[#F5F2ED] transition-colors text-[#8B857D]"
                     aria-label="Закрыть"
                  >
                     <X className="w-4 h-4" />
                  </button>
               </div>

               <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1">
                  {!isEdit && (
                     <ModeSelector mode={mode} onModeChange={setMode} />
                  )}

                  <form
                     id="lesson-form"
                     onSubmit={handleFormSubmit}
                     className="space-y-3 sm:space-y-4"
                  >
                     <ColorPicker
                        selectedColor={form.color}
                        onChange={(color) => setForm({ ...form, color })}
                     />

                     <div>
                        <label className="text-[10px] font-medium text-[#8B857D] mb-1 block pl-1">
                           Предмет / Группа
                        </label>
                        <input
                           type="text"
                           placeholder="Например: Основы жестового языка"
                           value={form.subject}
                           onChange={(e) =>
                              setForm({ ...form, subject: e.target.value })
                           }
                           required
                           className="w-full bg-[#F5F2ED]/70 focus:bg-white border border-[#E5E0D8] focus:border-[#8BA888] focus:outline-none transition-colors rounded-xl px-4 py-2 sm:py-2.5 text-[11px] sm:text-sm"
                        />
                     </div>

                     <MainTeacherFields
                        customTeacherName={form.customTeacherName}
                        onAdd={() => setForm(addMainTeacher(form))}
                        onUpdate={(index, value) =>
                           setForm(updateMainTeacher(form, index, value))
                        }
                        onRemove={(index) =>
                           setForm(removeMainTeacher(form, index))
                        }
                     />

                     {isRecurringMode && (
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
                                 setForm({
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
                              onChange={(e) =>
                                 setForm(updateFormDate(form, e.target.value))
                              }
                              required
                              className="w-full bg-[#F5F2ED]/70 focus:bg-white border border-[#E5E0D8] focus:border-[#8BA888] focus:outline-none transition-colors rounded-xl px-4 py-2 sm:py-2.5 text-[11px] sm:text-sm"
                           />
                        </div>
                     )}

                     {isRecurringMode && (
                        <div>
                           <label className="text-[10px] font-medium text-[#8B857D] mb-1.5 block pl-1">
                              Дни недели курса
                           </label>
                           <div className="flex gap-1.5 flex-wrap">
                              {DAYS_OF_WEEK.map((day) => {
                                 const isSelected = (
                                    form.daysOfWeek || []
                                 ).includes(day.key)

                                 return (
                                    <button
                                       key={day.key}
                                       type="button"
                                       onClick={() =>
                                          setForm(
                                             toggleFormDayOfWeek(form, day.key),
                                          )
                                       }
                                       className={`flex-1 min-w-[40px] py-2 text-[11px] sm:text-xs font-semibold rounded-xl border transition-all ${
                                          isSelected
                                             ? 'bg-[#8BA888] text-white border-[#8BA888] shadow-sm shadow-[#8BA888]/20'
                                             : 'bg-[#F5F2ED] text-[#5A534A] border-[#E5E0D8] hover:bg-[#EDE8E0]'
                                       }`}
                                    >
                                       {day.short}
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
                                 setForm({
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
                                 setForm({
                                    ...form,
                                    endTime: e.target.value,
                                 })
                              }
                              required
                              className="w-full bg-[#F5F2ED]/70 focus:bg-white border border-[#E5E0D8] focus:border-[#8BA888] focus:outline-none transition-colors rounded-xl px-3 py-2 sm:py-2.5 text-[11px] sm:text-sm"
                           />
                        </div>
                     </div>

                     {isRecurringMode && (
                        <DayOverridesList
                           daysOfWeek={form.daysOfWeek || []}
                           form={form}
                           onAddTeacher={(dayKey) =>
                              setForm(addDayTeacher(form, dayKey))
                           }
                           onUpdateTeacher={(dayKey, index, value) =>
                              setForm(
                                 updateDayTeacher(form, dayKey, index, value),
                              )
                           }
                           onRemoveTeacher={(dayKey, index) =>
                              setForm(removeDayTeacher(form, dayKey, index))
                           }
                           onTimeChange={(dayKey, field, value) =>
                              setForm(updateDayTime(form, dayKey, field, value))
                           }
                        />
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
                     onClick={closeForm}
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

         <TeacherScopeModal
            isOpen={showTeacherScopeModal}
            onClose={() => setShowTeacherScopeModal(false)}
            onConfirm={handleScopeConfirm}
         />
      </>
   )
}
