'use client'

import { useState, useEffect } from 'react'
import { X, Info, Eye, Check, Plus } from 'lucide-react'
import type { AdminUser, UserFormData } from '@/types/admin'

interface UserFormModalProps {
   isOpen: boolean
   editingUser: AdminUser | null
   error: string
   onClose: () => void
   onSubmit: (formData: UserFormData) => Promise<boolean>
}

const INITIAL_FORM: UserFormData = {
   email: '',
   login: '',
   password: '',
   name: '',
   role: 'USER',
   groups: [],
   isActive: true,
}

export function UserFormModal({
   isOpen,
   editingUser,
   error,
   onClose,
   onSubmit,
}: UserFormModalProps) {
   const [form, setForm] = useState<UserFormData>(INITIAL_FORM)
   const [isSubmitting, setIsSubmitting] = useState(false)
   const [availableGroups, setAvailableGroups] = useState<string[]>([])
   const [newGroupInput, setNewGroupInput] = useState('')

   useEffect(() => {
      if (!isOpen) return

      fetch('/api/admin/groups')
         .then((res) => (res.ok ? res.json() : { groups: [] }))
         .then((data) => setAvailableGroups(data.groups || []))
         .catch(() => setAvailableGroups([]))
   }, [isOpen])

   useEffect(() => {
      if (editingUser) {
         setForm({
            email: editingUser.email,
            login: editingUser.login,
            password: '',
            name: editingUser.name,
            role: editingUser.role,
            groups: editingUser.groups || [],
            isActive: editingUser.isActive,
         })
      } else {
         setForm(INITIAL_FORM)
      }
      setNewGroupInput('')
   }, [editingUser, isOpen])

   if (!isOpen) return null

   const toggleGroup = (group: string) => {
      setForm((prev) => {
         const exists = prev.groups.includes(group)
         return {
            ...prev,
            groups: exists
               ? prev.groups.filter((g) => g !== group)
               : [...prev.groups, group],
         }
      })
   }

   const handleAddCustomGroup = () => {
      const trimmed = newGroupInput.trim()
      if (!trimmed) return

      if (!form.groups.includes(trimmed)) {
         setForm((prev) => ({
            ...prev,
            groups: [...prev.groups, trimmed],
         }))
      }

      if (!availableGroups.includes(trimmed)) {
         setAvailableGroups((prev) => [...prev, trimmed].sort())
      }

      setNewGroupInput('')
   }

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setIsSubmitting(true)
      try {
         await onSubmit(form)
      } finally {
         setIsSubmitting(false)
      }
   }

   const isStudent = form.role === 'USER'
   const hasNoGroupsSelected = form.groups.length === 0

   return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#2C2824]/40 backdrop-blur-xs animate-in fade-in duration-200">
         <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-[#E5E0D8] w-full max-w-md max-h-[90dvh] flex flex-col overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[#E5E0D8] flex items-center justify-between shrink-0">
               <h3 className="text-base sm:text-lg font-bold text-[#3E3A35]">
                  {editingUser ? 'Редактировать' : 'Создать пользователя'}
               </h3>
               <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-[#F5F2ED] text-[#8B857D]"
                  aria-label="Закрыть"
               >
                  <X className="w-4 h-4" />
               </button>
            </div>

            <form
               onSubmit={handleSubmit}
               className="p-4 sm:p-6 space-y-3.5 overflow-y-auto flex-1 custom-scrollbar"
            >
               <div>
                  <label className="text-[10px] font-medium text-[#8B857D] mb-1 block pl-1">
                     Имя
                  </label>
                  <input
                     type="text"
                     placeholder="Имя Фамилия"
                     value={form.name}
                     onChange={(e) =>
                        setForm((prev) => ({ ...prev, name: e.target.value }))
                     }
                     required
                     className="w-full bg-[#F5F2ED]/70 focus:bg-white border border-[#E5E0D8] focus:border-[#8BA888] focus:outline-none rounded-xl px-3.5 py-2 text-xs sm:text-sm transition-colors"
                  />
               </div>

               <div>
                  <label className="text-[10px] font-medium text-[#8B857D] mb-1 block pl-1">
                     Логин
                  </label>
                  <input
                     type="text"
                     placeholder="login"
                     value={form.login}
                     onChange={(e) =>
                        setForm((prev) => ({ ...prev, login: e.target.value }))
                     }
                     required
                     className="w-full bg-[#F5F2ED]/70 focus:bg-white border border-[#E5E0D8] focus:border-[#8BA888] focus:outline-none rounded-xl px-3.5 py-2 text-xs sm:text-sm transition-colors"
                  />
               </div>

               <div>
                  <label className="text-[10px] font-medium text-[#8B857D] mb-1 block pl-1">
                     Email
                  </label>
                  <input
                     type="email"
                     placeholder="user@mail.com"
                     value={form.email}
                     onChange={(e) =>
                        setForm((prev) => ({ ...prev, email: e.target.value }))
                     }
                     required
                     className="w-full bg-[#F5F2ED]/70 focus:bg-white border border-[#E5E0D8] focus:border-[#8BA888] focus:outline-none rounded-xl px-3.5 py-2 text-xs sm:text-sm transition-colors"
                  />
               </div>

               <div>
                  <label className="text-[10px] font-medium text-[#8B857D] mb-1 block pl-1">
                     {editingUser ? 'Новый пароль (оставьте пустым)' : 'Пароль'}
                  </label>
                  <input
                     type="password"
                     placeholder={
                        editingUser
                           ? 'Оставьте пустым для сохранения старого'
                           : 'Минимум 6 символов'
                     }
                     value={form.password || ''}
                     onChange={(e) =>
                        setForm((prev) => ({
                           ...prev,
                           password: e.target.value,
                        }))
                     }
                     required={!editingUser}
                     className="w-full bg-[#F5F2ED]/70 focus:bg-white border border-[#E5E0D8] focus:border-[#8BA888] focus:outline-none rounded-xl px-3.5 py-2 text-xs sm:text-sm transition-colors"
                  />
               </div>

               <div>
                  <label className="text-[10px] font-medium text-[#8B857D] mb-1 block pl-1">
                     Роль
                  </label>
                  <select
                     value={form.role}
                     onChange={(e) =>
                        setForm((prev) => ({
                           ...prev,
                           role: e.target.value as AdminUser['role'],
                        }))
                     }
                     className="w-full bg-[#F5F2ED]/70 focus:bg-white border border-[#E5E0D8] focus:border-[#8BA888] focus:outline-none rounded-xl px-3.5 py-2 text-xs sm:text-sm transition-colors"
                  >
                     <option value="USER">Пользователь (ученик)</option>
                     <option value="TEACHER">Учитель</option>
                     <option value="ADMIN">Администратор</option>
                  </select>
               </div>

               {isStudent && (
                  <div className="pt-2 border-t border-[#F0EDE8] space-y-2.5">
                     <div className="flex items-center justify-between">
                        <label className="text-[11px] font-semibold text-[#3E3A35]">
                           Группы ученика
                        </label>
                        {hasNoGroupsSelected ? (
                           <span className="text-[10px] font-semibold text-[#8BA888] bg-[#E8F0E8] px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              Все группы видны
                           </span>
                        ) : (
                           <span className="text-[10px] font-semibold text-[#6C757D] bg-[#F5F2ED] px-2 py-0.5 rounded-full">
                              Выбрано: {form.groups.length}
                           </span>
                        )}
                     </div>

                     <div className="flex gap-1.5">
                        <input
                           type="text"
                           placeholder="Добавить группу (например, Группа 1)"
                           value={newGroupInput}
                           onChange={(e) => setNewGroupInput(e.target.value)}
                           onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                 e.preventDefault()
                                 handleAddCustomGroup()
                              }
                           }}
                           className="flex-1 bg-[#F5F2ED]/70 focus:bg-white border border-[#E5E0D8] focus:border-[#8BA888] focus:outline-none rounded-xl px-3 py-1.5 text-xs transition-colors"
                        />
                        <button
                           type="button"
                           onClick={handleAddCustomGroup}
                           disabled={!newGroupInput.trim()}
                           className="px-3 py-1.5 bg-[#8BA888] hover:bg-[#7A9A77] disabled:opacity-40 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                           <Plus className="w-3.5 h-3.5" />
                           <span>Добавить</span>
                        </button>
                     </div>

                     {availableGroups.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 p-2 bg-[#FAF8F5] rounded-xl border border-[#E5E0D8] max-h-36 overflow-y-auto custom-scrollbar">
                           {availableGroups.map((group) => {
                              const isSelected = form.groups.includes(group)
                              return (
                                 <button
                                    key={group}
                                    type="button"
                                    onClick={() => toggleGroup(group)}
                                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                                       isSelected
                                          ? 'bg-[#8BA888] text-white shadow-2xs'
                                          : 'bg-white text-[#5C554E] border border-[#E5E0D8] hover:border-[#8BA888]'
                                    }`}
                                 >
                                    {isSelected && (
                                       <Check className="w-3 h-3" />
                                    )}
                                    <span>{group}</span>
                                 </button>
                              )
                           })}
                        </div>
                     ) : (
                        <div className="p-2.5 bg-[#FAF8F5] rounded-xl border border-[#E5E0D8] text-center text-xs text-[#8B857D]">
                           Нет сохранённых групп. Введите название выше и
                           нажмите «Добавить».
                        </div>
                     )}

                     {hasNoGroupsSelected ? (
                        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-[#F4F7F4] border border-[#D8E6D8] text-[#3E5C3B] text-xs">
                           <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#6B8E68]" />
                           <p className="leading-relaxed">
                              <strong>Группы не выбраны:</strong> ученику будут
                              видны{' '}
                              <span className="underline decoration-[#8BA888]">
                                 все занятия в расписании
                              </span>
                              .
                           </p>
                        </div>
                     ) : (
                        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8] text-[#7A7369] text-xs">
                           <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#8BA888]" />
                           <p className="leading-relaxed">
                              Ученик увидит в сетке только занятия выбранных
                              групп: <strong>{form.groups.join(', ')}</strong>.
                           </p>
                        </div>
                     )}
                  </div>
               )}

               {editingUser && (
                  <div className="flex items-center gap-2 pt-1 pl-1">
                     <input
                        type="checkbox"
                        id="isActive"
                        checked={form.isActive}
                        onChange={(e) =>
                           setForm((prev) => ({
                              ...prev,
                              isActive: e.target.checked,
                           }))
                        }
                        className="w-4 h-4 rounded border-[#E5E0D8] text-[#8BA888] focus:ring-[#8BA888]"
                     />
                     <label
                        htmlFor="isActive"
                        className="text-xs font-semibold text-[#3E3A35] cursor-pointer"
                     >
                        Активный аккаунт
                     </label>
                  </div>
               )}

               {error && (
                  <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                     {error}
                  </div>
               )}

               <div className="flex gap-2 pt-2">
                  <button
                     type="button"
                     onClick={onClose}
                     disabled={isSubmitting}
                     className="flex-1 py-2 text-xs font-semibold bg-[#F5F2ED] hover:bg-[#EDE8E0] text-[#3E3A35] rounded-xl transition-colors"
                  >
                     Отмена
                  </button>
                  <button
                     type="submit"
                     disabled={isSubmitting}
                     className="flex-1 py-2 text-xs font-semibold bg-[#8BA888] hover:bg-[#7A9A77] text-white rounded-xl shadow-xs transition-colors disabled:opacity-50"
                  >
                     {editingUser ? 'Сохранить' : 'Создать'}
                  </button>
               </div>
            </form>
         </div>
      </div>
   )
}
