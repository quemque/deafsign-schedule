'use client'

import { X } from 'lucide-react'
import { DAYS_OF_WEEK } from '@/constants/schedule'

interface FormDataState {
   subject: string
   comment: string
   date: string
   dayOfWeek: string
   startTime: string
   endTime: string
}

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
   return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#2C2824]/40 backdrop-blur-xs">
         <div className="bg-white rounded-2xl shadow-2xl border border-[#E5E0D8] w-full max-w-md max-h-[90dvh] flex flex-col overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-[#E5E0D8] flex items-center justify-between shrink-0">
               <h3 className="text-lg font-bold">
                  {isEdit ? 'Редактирование' : 'Новая группа'}
               </h3>
               <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-[#F5F2ED] transition-colors"
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
                  <input
                     type="text"
                     placeholder="Группа"
                     value={form.subject}
                     onChange={(e) =>
                        onFormChange({ ...form, subject: e.target.value })
                     }
                     required
                     className="w-full bg-[#F5F2ED]/70 focus:bg-white border border-[#E5E0D8] focus:border-[#8BA888] focus:outline-none transition-colors rounded-xl px-4 py-2 sm:py-2.5 text-[11px] sm:text-sm"
                  />

                  {!isEdit && mode === 'once' && (
                     <input
                        type="date"
                        value={form.date}
                        onChange={(e) =>
                           onFormChange({ ...form, date: e.target.value })
                        }
                        required
                        className="w-full bg-[#F5F2ED]/70 focus:bg-white border border-[#E5E0D8] focus:border-[#8BA888] focus:outline-none transition-colors rounded-xl px-4 py-2 sm:py-2.5 text-[11px] sm:text-sm"
                     />
                  )}

                  {!isEdit && mode === 'weekly' && (
                     <select
                        value={form.dayOfWeek}
                        onChange={(e) =>
                           onFormChange({ ...form, dayOfWeek: e.target.value })
                        }
                        className="w-full bg-[#F5F2ED]/70 focus:bg-white border border-[#E5E0D8] focus:border-[#8BA888] focus:outline-none transition-colors rounded-xl px-4 py-2 sm:py-2.5 text-[11px] sm:text-sm appearance-none"
                     >
                        {DAYS_OF_WEEK.map((d) => (
                           <option key={d.key} value={d.key}>
                              {d.label}
                           </option>
                        ))}
                     </select>
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

                  <textarea
                     placeholder="Комментарий (необязательно)"
                     value={form.comment}
                     onChange={(e) =>
                        onFormChange({ ...form, comment: e.target.value })
                     }
                     rows={2}
                     className="w-full bg-[#F5F2ED]/70 focus:bg-white border border-[#E5E0D8] focus:border-[#8BA888] focus:outline-none transition-colors rounded-xl px-4 py-2.5 sm:py-3 text-[11px] sm:text-sm resize-none"
                  />

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
