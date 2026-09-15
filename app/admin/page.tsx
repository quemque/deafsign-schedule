'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
   Plus,
   Edit,
   X,
   Shield,
   ArrowLeft,
   LogOut,
   Mail,
   UserCheck,
   UserX,
} from 'lucide-react'

interface AdminUser {
   id: string
   email: string
   login: string
   name: string
   role: string
   isActive: boolean
   createdAt: string
   lastLoginAt: string | null
}

export default function AdminPage() {
   const router = useRouter()
   const [users, setUsers] = useState<AdminUser[]>([])
   const [loading, setLoading] = useState(true)
   const [showModal, setShowModal] = useState(false)
   const [editingUser, setEditingUser] = useState<AdminUser | null>(null)

   const [form, setForm] = useState({
      email: '',
      login: '',
      password: '',
      name: '',
      role: 'TEACHER',
      isActive: true,
   })
   const [error, setError] = useState('')

   const fetchUsers = async () => {
      const res = await fetch('/api/admin/users')
      if (res.ok) {
         const data = await res.json()
         setUsers(data.users)
      }
      setLoading(false)
   }

   useEffect(() => {
      fetchUsers()
   }, [])

   const handleBackToSchedule = () => {
      router.push('/')
   }

   const handleLogout = async () => {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
   }

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setError('')

      const url = editingUser
         ? `/api/admin/users/${editingUser.id}`
         : '/api/admin/users'
      const method = editingUser ? 'PATCH' : 'POST'

      const body = editingUser
         ? {
              email: form.email,
              name: form.name,
              role: form.role,
              isActive: form.isActive,
              ...(form.password ? { password: form.password } : {}),
           }
         : form

      const res = await fetch(url, {
         method,
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(body),
      })

      if (!res.ok) {
         const data = await res.json()
         setError(data.error)
         return
      }

      setShowModal(false)
      setEditingUser(null)
      setForm({
         email: '',
         login: '',
         password: '',
         name: '',
         role: 'TEACHER',
         isActive: true,
      })
      fetchUsers()
   }

   const handleEdit = (user: AdminUser) => {
      setEditingUser(user)
      setForm({
         email: user.email,
         login: user.login,
         password: '',
         name: user.name,
         role: user.role,
         isActive: user.isActive,
      })
      setShowModal(true)
   }

   const handleToggleActive = async (user: AdminUser) => {
      const nextStatus = !user.isActive
      const actionText = nextStatus ? 'активировать' : 'деактивировать'

      if (
         !confirm(
            `Вы действительно хотите ${actionText} пользователя ${user.name}?`,
         )
      )
         return

      const res = await fetch(`/api/admin/users/${user.id}`, {
         method: 'PATCH',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ isActive: nextStatus }),
      })

      if (res.ok) {
         fetchUsers()
      }
   }

   const getRoleBadgeClass = (role: string) => {
      switch (role) {
         case 'ADMIN':
            return 'bg-purple-100 text-purple-700'
         case 'TEACHER':
            return 'bg-[#E0E8E0] text-[#4A674A]'
         default:
            return 'bg-[#E0E5E8] text-[#4A5867]'
      }
   }

   return (
      <div className="min-h-screen bg-[#FAF8F5] text-[#3E3A35] font-sans flex flex-col">
         <header className="sticky top-0 z-30 bg-[#FDFCFB]/90 backdrop-blur-md border-b border-[#E5E0D8] px-3 sm:px-6 py-2.5 sm:py-3 shrink-0">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
               <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <button
                     onClick={handleBackToSchedule}
                     className="p-1.5 sm:p-2 rounded-xl hover:bg-[#F5F2ED] text-[#8B857D] transition-colors shrink-0"
                     title="К расписанию"
                  >
                     <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#8BA888] flex items-center justify-center text-white shrink-0">
                     <Shield className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 truncate">
                     <h1 className="text-xs sm:text-sm font-bold truncate leading-tight">
                        Админ-панель
                     </h1>
                     <p className="text-[10px] sm:text-[11px] text-[#8B857D] truncate">
                        Управление пользователями
                     </p>
                  </div>
               </div>

               <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <button
                     onClick={handleBackToSchedule}
                     className="hidden md:flex px-3 py-1.5 text-xs font-semibold bg-[#F5F2ED] border border-[#E5E0D8] rounded-xl hover:bg-[#EDE8E0] items-center gap-1.5 transition-colors"
                  >
                     <ArrowLeft className="w-3.5 h-3.5" />
                     <span>К расписанию</span>
                  </button>
                  <button
                     onClick={handleLogout}
                     className="p-2 sm:px-3 sm:py-1.5 text-xs font-semibold bg-[#F5F2ED] border border-[#E5E0D8] rounded-xl hover:bg-[#EDE8E0] flex items-center gap-1.5 transition-colors text-red-600"
                     title="Выйти"
                  >
                     <LogOut className="w-3.5 h-3.5" />
                     <span className="hidden sm:inline">Выйти</span>
                  </button>
               </div>
            </div>
         </header>

         <main className="max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between gap-2 mb-4 sm:mb-6">
               <h2 className="text-base sm:text-lg font-bold">
                  Пользователи{' '}
                  <span className="text-[#8B857D] text-xs sm:text-sm font-medium">
                     ({users.length})
                  </span>
               </h2>
               <button
                  onClick={() => {
                     setEditingUser(null)
                     setForm({
                        email: '',
                        login: '',
                        password: '',
                        name: '',
                        role: 'TEACHER',
                        isActive: true,
                     })
                     setShowModal(true)
                  }}
                  className="px-3 py-2 sm:px-4 sm:py-2 text-xs font-semibold bg-[#8BA888] hover:bg-[#7A9A77] text-white rounded-xl flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
               >
                  <Plus className="w-4 h-4" />
                  <span>Создать</span>
               </button>
            </div>

            {loading ? (
               <div className="text-center py-12 text-xs sm:text-sm text-[#8B857D]">
                  Загрузка...
               </div>
            ) : (
               <>
                  <div className="md:hidden space-y-2.5">
                     {users.map((user) => (
                        <div
                           key={user.id}
                           className="bg-white rounded-2xl border border-[#E5E0D8] p-3.5 shadow-2xs space-y-2.5"
                        >
                           <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                 <h3 className="text-xs font-bold text-[#3E3A35] truncate">
                                    {user.name}
                                 </h3>
                                 <p className="text-[11px] text-[#8B857D] font-mono truncate">
                                    @{user.login}
                                 </p>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                 <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getRoleBadgeClass(
                                       user.role,
                                    )}`}
                                 >
                                    {user.role}
                                 </span>
                                 <span
                                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                       user.isActive
                                          ? 'bg-green-100 text-green-700'
                                          : 'bg-red-100 text-red-700'
                                    }`}
                                 >
                                    {user.isActive ? 'Активен' : 'Отключён'}
                                 </span>
                              </div>
                           </div>

                           <div className="flex items-center gap-1.5 text-[11px] text-[#8B857D] truncate">
                              <Mail className="w-3 h-3 shrink-0 opacity-60" />
                              <span className="truncate">{user.email}</span>
                           </div>

                           <div className="pt-2 border-t border-[#F0EDE8] flex items-center justify-end gap-2">
                              <button
                                 onClick={() => handleToggleActive(user)}
                                 className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                                    user.isActive
                                       ? 'bg-amber-50 hover:bg-amber-100 text-amber-700'
                                       : 'bg-green-50 hover:bg-green-100 text-green-700'
                                 }`}
                              >
                                 {user.isActive ? (
                                    <>
                                       <UserX className="w-3.5 h-3.5" />
                                       <span>Отключить</span>
                                    </>
                                 ) : (
                                    <>
                                       <UserCheck className="w-3.5 h-3.5" />
                                       <span>Включить</span>
                                    </>
                                 )}
                              </button>
                              <button
                                 onClick={() => handleEdit(user)}
                                 className="px-3 py-1.5 rounded-lg bg-[#F5F2ED] hover:bg-[#EDE8E0] text-xs font-semibold text-[#5A534A] flex items-center gap-1 transition-colors"
                              >
                                 <Edit className="w-3.5 h-3.5" />
                                 <span>Изменить</span>
                              </button>
                           </div>
                        </div>
                     ))}
                  </div>

                  <div className="hidden md:block bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden shadow-2xs">
                     <table className="w-full">
                        <thead className="bg-[#FDFCFB] border-b border-[#E5E0D8]">
                           <tr>
                              <th className="text-left px-4 py-3 text-xs font-semibold text-[#8B857D] uppercase">
                                 Имя
                              </th>
                              <th className="text-left px-4 py-3 text-xs font-semibold text-[#8B857D] uppercase">
                                 Логин
                              </th>
                              <th className="text-left px-4 py-3 text-xs font-semibold text-[#8B857D] uppercase">
                                 Email
                              </th>
                              <th className="text-left px-4 py-3 text-xs font-semibold text-[#8B857D] uppercase">
                                 Роль
                              </th>
                              <th className="text-left px-4 py-3 text-xs font-semibold text-[#8B857D] uppercase">
                                 Статус
                              </th>
                              <th className="text-right px-4 py-3 text-xs font-semibold text-[#8B857D] uppercase">
                                 Действия
                              </th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F0EDE8]">
                           {users.map((user) => (
                              <tr
                                 key={user.id}
                                 className="hover:bg-[#FDFCFB]/50 transition-colors"
                              >
                                 <td className="px-4 py-3 text-sm font-medium text-[#3E3A35]">
                                    {user.name}
                                 </td>
                                 <td className="px-4 py-3 text-sm text-[#8B857D]">
                                    {user.login}
                                 </td>
                                 <td className="px-4 py-3 text-sm text-[#8B857D]">
                                    {user.email}
                                 </td>
                                 <td className="px-4 py-3">
                                    <span
                                       className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${getRoleBadgeClass(
                                          user.role,
                                       )}`}
                                    >
                                       {user.role}
                                    </span>
                                 </td>
                                 <td className="px-4 py-3">
                                    <span
                                       className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                          user.isActive
                                             ? 'bg-green-100 text-green-700'
                                             : 'bg-red-100 text-red-700'
                                       }`}
                                    >
                                       {user.isActive ? 'Активен' : 'Отключён'}
                                    </span>
                                 </td>
                                 <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                       <button
                                          onClick={() =>
                                             handleToggleActive(user)
                                          }
                                          className={`p-1.5 rounded-lg transition-colors ${
                                             user.isActive
                                                ? 'hover:bg-amber-50 text-amber-600'
                                                : 'hover:bg-green-50 text-green-600'
                                          }`}
                                          title={
                                             user.isActive
                                                ? 'Деактивировать'
                                                : 'Активировать'
                                          }
                                       >
                                          {user.isActive ? (
                                             <UserX className="w-4 h-4" />
                                          ) : (
                                             <UserCheck className="w-4 h-4" />
                                          )}
                                       </button>
                                       <button
                                          onClick={() => handleEdit(user)}
                                          className="p-1.5 rounded-lg hover:bg-[#F5F2ED] text-[#8B857D] transition-colors"
                                          title="Редактировать"
                                       >
                                          <Edit className="w-4 h-4" />
                                       </button>
                                    </div>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </>
            )}
         </main>

         {showModal && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#2C2824]/40 backdrop-blur-xs animate-in fade-in duration-200">
               <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-[#E5E0D8] w-full max-w-md max-h-[90dvh] flex flex-col overflow-hidden">
                  <div className="p-4 sm:p-5 border-b border-[#E5E0D8] flex items-center justify-between shrink-0">
                     <h3 className="text-base sm:text-lg font-bold text-[#3E3A35]">
                        {editingUser ? 'Редактировать' : 'Создать пользователя'}
                     </h3>
                     <button
                        onClick={() => setShowModal(false)}
                        className="p-1.5 rounded-lg hover:bg-[#F5F2ED] text-[#8B857D]"
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
                              setForm({ ...form, name: e.target.value })
                           }
                           required
                           className="w-full bg-[#F5F2ED]/70 focus:bg-white border border-[#E5E0D8] focus:border-[#8BA888] focus:outline-none rounded-xl px-3.5 py-2 text-xs sm:text-sm transition-colors"
                        />
                     </div>

                     {!editingUser && (
                        <div>
                           <label className="text-[10px] font-medium text-[#8B857D] mb-1 block pl-1">
                              Логин
                           </label>
                           <input
                              type="text"
                              placeholder="login"
                              value={form.login}
                              onChange={(e) =>
                                 setForm({ ...form, login: e.target.value })
                              }
                              required
                              className="w-full bg-[#F5F2ED]/70 focus:bg-white border border-[#E5E0D8] focus:border-[#8BA888] focus:outline-none rounded-xl px-3.5 py-2 text-xs sm:text-sm transition-colors"
                           />
                        </div>
                     )}

                     <div>
                        <label className="text-[10px] font-medium text-[#8B857D] mb-1 block pl-1">
                           Email
                        </label>
                        <input
                           type="email"
                           placeholder="user@mail.com"
                           value={form.email}
                           onChange={(e) =>
                              setForm({ ...form, email: e.target.value })
                           }
                           required
                           className="w-full bg-[#F5F2ED]/70 focus:bg-white border border-[#E5E0D8] focus:border-[#8BA888] focus:outline-none rounded-xl px-3.5 py-2 text-xs sm:text-sm transition-colors"
                        />
                     </div>

                     <div>
                        <label className="text-[10px] font-medium text-[#8B857D] mb-1 block pl-1">
                           {editingUser
                              ? 'Новый пароль (оставьте пустым)'
                              : 'Пароль'}
                        </label>
                        <input
                           type="password"
                           placeholder={
                              editingUser
                                 ? 'Оставьте пустым для сохранения старого'
                                 : 'Минимум 6 символов'
                           }
                           value={form.password}
                           onChange={(e) =>
                              setForm({ ...form, password: e.target.value })
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
                              setForm({ ...form, role: e.target.value })
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
                                 setForm({
                                    ...form,
                                    isActive: e.target.checked,
                                 })
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
                           onClick={() => setShowModal(false)}
                           className="flex-1 py-2 text-xs font-semibold bg-[#F5F2ED] hover:bg-[#EDE8E0] text-[#3E3A35] rounded-xl transition-colors"
                        >
                           Отмена
                        </button>
                        <button
                           type="submit"
                           className="flex-1 py-2 text-xs font-semibold bg-[#8BA888] hover:bg-[#7A9A77] text-white rounded-xl shadow-xs transition-colors"
                        >
                           {editingUser ? 'Сохранить' : 'Создать'}
                        </button>
                     </div>
                  </form>
               </div>
            </div>
         )}
      </div>
   )
}
