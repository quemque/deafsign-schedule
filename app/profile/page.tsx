'use client'

import { useEffect, useState } from 'react'
import { User, Mail, Shield, Calendar, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
   const [user, setUser] = useState<any>(null)
   const [loading, setLoading] = useState(true)

   useEffect(() => {
      fetch('/api/auth/me')
         .then((res) => res.json())
         .then((data) => setUser(data.user))
         .finally(() => setLoading(false))
   }, [])

   if (loading) {
      return (
         <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
            <div className="text-sm text-[#8B857D]">Загрузка...</div>
         </div>
      )
   }

   if (!user) {
      return (
         <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
            <Link href="/login" className="text-sm text-[#8BA888]">
               Войти в систему
            </Link>
         </div>
      )
   }

   const getRoleLabel = (role: string) => {
      switch (role) {
         case 'ADMIN':
            return 'Администратор'
         case 'TEACHER':
            return 'Преподаватель'
         case 'USER':
            return 'Пользователь'
         default:
            return role
      }
   }

   return (
      <div className="min-h-screen bg-[#FAF8F5] text-[#3E3A35] font-sans">
         <div className="max-w-2xl mx-auto px-4 py-8">
            <Link
               href="/"
               className="inline-flex items-center gap-2 text-xs text-[#8B857D] hover:text-[#3E3A35] mb-6"
            >
               <ArrowLeft className="w-4 h-4" />
               Назад к расписанию
            </Link>

            <div className="bg-white rounded-2xl border border-[#E5E0D8] shadow-sm p-6 sm:p-8">
               <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-[#8BA888] flex items-center justify-center text-white text-xl font-bold">
                     {user.name
                        .split(' ')
                        .map((n: string) => n[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()}
                  </div>
                  <div>
                     <h1 className="text-xl font-bold">{user.name}</h1>
                     <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-[#E8F0E8] border border-[#C8D6C8] text-[10px] font-medium text-[#5A7A5A]">
                        {getRoleLabel(user.role)}
                     </span>
                  </div>
               </div>

               <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FDFCFB] border border-[#F0EDE8]">
                     <User className="w-4 h-4 text-[#5A7A5A]" />
                     <div>
                        <span className="block text-[10px] uppercase text-[#B0A89E] font-medium">
                           Логин
                        </span>
                        <span className="text-sm font-semibold">
                           {user.login}
                        </span>
                     </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FDFCFB] border border-[#F0EDE8]">
                     <Mail className="w-4 h-4 text-[#5A7A5A]" />
                     <div>
                        <span className="block text-[10px] uppercase text-[#B0A89E] font-medium">
                           Email
                        </span>
                        <span className="text-sm font-semibold">
                           {user.email}
                        </span>
                     </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FDFCFB] border border-[#F0EDE8]">
                     <Shield className="w-4 h-4 text-[#5A7A5A]" />
                     <div>
                        <span className="block text-[10px] uppercase text-[#B0A89E] font-medium">
                           Роль
                        </span>
                        <span className="text-sm font-semibold">
                           {getRoleLabel(user.role)}
                        </span>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   )
}
