'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, User, Trash2, Edit, X, Shield, ArrowLeft } from 'lucide-react'

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
      setForm({ email: '', login: '', password: '', name: '', role: 'TEACHER' })
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
      })
      setShowModal(true)
   }

   const handleDelete = async (id: string) => {
      if (!confirm('Деактивировать пользователя?')) return
      await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
      fetchUsers()
   }

   return (
      <div className="min-h-screen bg-[#FAF8F5] text-[#3E3A35] font-sans">
         <header className="sticky top-0 z-30 bg-[#FDFCFB]/90 backdrop-blur-md border-b border-[#E5E0D8] px-4 lg:px-8 py-3">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <button
                     onClick={handleBackToSchedule}
                     className="p-2 rounded-lg hover:bg-[#F5F2ED] text-[#8B857D] transition-colors"
                     title="Вернуться к расписанию"
                  >
                     <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div className="w-9 h-9 rounded-xl bg-[#8BA888] flex items-center justify-center text-white">
                     <Shield className="w-4 h-4" />
                  </div>
                  <div>
                     <h1 className="text-sm font-semibold">Админ-панель</h1>
                     <p className="text-[11px] text-[#8B857D]">
                        Управление пользователями
                     </p>
                  </div>
               </div>
               <div className="flex items-center gap-2">
                  <button
                     onClick={handleBackToSchedule}
                     className="px-3 py-1.5 text-xs font-medium bg-[#F5F2ED] border border-[#E5E0D8] rounded-lg hover:bg-[#EDE8E0] flex items-center gap-1.5"
                  >
                     <ArrowLeft className="w-3.5 h-3.5" />К расписанию
                  </button>
                  <button
                     onClick={handleLogout}
                     className="px-3 py-1.5 text-xs font-medium bg-[#F5F2ED] border border-[#E5E0D8] rounded-lg hover:bg-[#EDE8E0]"
                  >
                     Выйти
                  </button>
               </div>
            </div>
         </header>

         <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
            <div className="flex items-center justify-between mb-6">
               <h2 className="text-lg font-bold">
                  Пользователи ({users.length})
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
                     })
                     setShowModal(true)
                  }}
                  className="px-4 py-2 text-xs font-semibold bg-[#8BA888] hover:bg-[#7A9A77] text-white rounded-xl flex items-center gap-2"
               >
                  <Plus className="w-4 h-4" /> Создать пользователя
               </button>
            </div>

            {loading ? (
               <div className="text-center py-12 text-[#8B857D]">
                  Загрузка...
               </div>
            ) : (
               <div className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden">
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
                           <tr key={user.id} className="hover:bg-[#FDFCFB]/50">
                              <td className="px-4 py-3 text-sm font-medium">
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
                                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                       user.role === 'ADMIN'
                                          ? 'bg-purple-100 text-purple-700'
                                          : user.role === 'TEACHER'
                                            ? 'bg-[#E0E8E0] text-[#4A674A]'
                                            : 'bg-[#E0E5E8] text-[#4A5867]'
                                    }`}
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
                                 <div className="flex items-center justify-end gap-2">
                                    <button
                                       onClick={() => handleEdit(user)}
                                       className="p-1.5 rounded-lg hover:bg-[#F5F2ED] text-[#8B857D]"
                                    >
                                       <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                       onClick={() => handleDelete(user.id)}
                                       className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
                                    >
                                       <Trash2 className="w-4 h-4" />
                                    </button>
                                 </div>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            )}
         </main>

         {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2C2824]/40 backdrop-blur-xs">
               <div className="bg-white rounded-2xl shadow-2xl border border-[#E5E0D8] w-full max-w-md p-6">
                  <div className="flex items-center justify-between mb-4">
                     <h3 className="text-lg font-bold">
                        {editingUser ? 'Редактировать' : 'Создать пользователя'}
                     </h3>
                     <button
                        onClick={() => setShowModal(false)}
                        className="p-1.5 rounded-lg hover:bg-[#F5F2ED]"
                     >
                        <X className="w-4 h-4" />
                     </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                     <input
                        type="text"
                        placeholder="Имя"
                        value={form.name}
                        onChange={(e) =>
                           setForm({ ...form, name: e.target.value })
                        }
                        required
                        className="w-full bg-[#F5F2ED]/70 border border-[#E5E0D8] rounded-xl px-4 py-2.5 text-sm"
                     />
                     {!editingUser && (
                        <input
                           type="text"
                           placeholder="Логин"
                           value={form.login}
                           onChange={(e) =>
                              setForm({ ...form, login: e.target.value })
                           }
                           required
                           className="w-full bg-[#F5F2ED]/70 border border-[#E5E0D8] rounded-xl px-4 py-2.5 text-sm"
                        />
                     )}
                     <input
                        type="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={(e) =>
                           setForm({ ...form, email: e.target.value })
                        }
                        required
                        className="w-full bg-[#F5F2ED]/70 border border-[#E5E0D8] rounded-xl px-4 py-2.5 text-sm"
                     />
                     <input
                        type="password"
                        placeholder={
                           editingUser
                              ? 'Новый пароль (оставьте пустым)'
                              : 'Пароль'
                        }
                        value={form.password}
                        onChange={(e) =>
                           setForm({ ...form, password: e.target.value })
                        }
                        required={!editingUser}
                        className="w-full bg-[#F5F2ED]/70 border border-[#E5E0D8] rounded-xl px-4 py-2.5 text-sm"
                     />
                     <select
                        value={form.role}
                        onChange={(e) =>
                           setForm({ ...form, role: e.target.value })
                        }
                        className="w-full bg-[#F5F2ED]/70 border border-[#E5E0D8] rounded-xl px-4 py-2.5 text-sm"
                     >
                        <option value="USER">Пользователь (просмотр)</option>
                        <option value="TEACHER">Учитель</option>
                        <option value="ADMIN">Администратор</option>
                     </select>

                     {error && (
                        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                           {error}
                        </div>
                     )}

                     <div className="flex gap-3 pt-2">
                        <button
                           type="button"
                           onClick={() => setShowModal(false)}
                           className="flex-1 py-2.5 text-xs font-semibold bg-[#F5F2ED] rounded-xl"
                        >
                           Отмена
                        </button>
                        <button
                           type="submit"
                           className="flex-1 py-2.5 text-xs font-semibold bg-[#8BA888] hover:bg-[#7A9A77] text-white rounded-xl"
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
