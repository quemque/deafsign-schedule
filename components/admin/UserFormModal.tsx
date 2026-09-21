'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
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
   role: 'TEACHER',
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

   useEffect(() => {
      if (editingUser) {
         setForm({
            email: editingUser.email,
            login: editingUser.login,
            password: '',
            name: editingUser.name,
            role: editingUser.role,
            isActive: editingUser.isActive,
         })
      } else {
         setForm(INITIAL_FORM)
      }
   }, [editingUser, isOpen])

   if (!isOpen) return null

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setIsSubmitting(true)
      try {
         await onSubmit(form)
      } finally {
         setIsSubmitting(false)
      }
   }

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
                        setForm((prev) => ({ ...prev, role: e.target.value }))
                     }
                     className="w-full bg-[#F5F2ED]/70 focus:bg-white border border-[#E5E0D8] focus:border-[#8BA888] focus:outline-none rounded-xl px-3.5 py-2 text-xs sm:text-sm transition-colors"
                  >
                     <option value="USER">Пользователь (просмотр)</option>
                     <option value="TEACHER">Учитель</option>
                     <option value="ADMIN">Администратор</option>
                  </select>
               </div>

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
