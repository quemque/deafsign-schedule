'use client'

import { User, Mail, Shield, ArrowLeft, LogOut } from 'lucide-react'
import Link from 'next/link'
import { useProfile } from '@/hooks/useProfile'
import { getRoleLabel, getUserInitials } from '@/utils/user'
import { ProfileInfoCard } from '@/components/profile/ProfileInfoCard'

function ProfileLoadingState() {
   return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
         <div className="text-sm text-[#8B857D]">Загрузка...</div>
      </div>
   )
}

function ProfileNotFoundState() {
   return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
         <Link
            href="/login"
            className="text-sm font-semibold text-[#8BA888] hover:underline"
         >
            Войти в систему
         </Link>
      </div>
   )
}

export default function ProfilePage() {
   const { user, loading, isLoggingOut, logout } = useProfile()

   if (loading) {
      return <ProfileLoadingState />
   }

   if (!user) {
      return <ProfileNotFoundState />
   }

   const initials = getUserInitials(user.name)
   const roleLabel = getRoleLabel(user.role)

   return (
      <div className="min-h-screen bg-[#FAF8F5] text-[#3E3A35] font-sans">
         <div className="max-w-2xl mx-auto px-4 py-8">
            <Link
               href="/"
               className="inline-flex items-center gap-2 text-xs text-[#8B857D] hover:text-[#3E3A35] mb-6 transition-colors"
            >
               <ArrowLeft className="w-4 h-4" />
               Назад к расписанию
            </Link>

            <div className="bg-white rounded-2xl border border-[#E5E0D8] shadow-sm p-6 sm:p-8">
               <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-[#8BA888] flex items-center justify-center text-white text-xl font-bold shrink-0">
                     {initials}
                  </div>

                  <div className="min-w-0">
                     <h1 className="text-xl font-bold truncate text-[#3E3A35]">
                        {user.name}
                     </h1>
                     <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full bg-[#E8F0E8] border border-[#C8D6C8] text-[10px] font-medium text-[#5A7A5A]">
                        {roleLabel}
                     </span>
                  </div>
               </div>

               <div className="space-y-3">
                  <ProfileInfoCard
                     icon={<User className="w-4 h-4" />}
                     label="Логин"
                     value={user.login}
                  />

                  <ProfileInfoCard
                     icon={<Mail className="w-4 h-4" />}
                     label="Email"
                     value={user.email}
                  />

                  <ProfileInfoCard
                     icon={<Shield className="w-4 h-4" />}
                     label="Роль"
                     value={roleLabel}
                  />
               </div>

               <div className="mt-8 pt-6 border-t border-[#F0EDE8]">
                  <button
                     type="button"
                     onClick={logout}
                     disabled={isLoggingOut}
                     className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                     <LogOut className="w-4 h-4" />
                     {isLoggingOut ? 'Выход...' : 'Выйти из аккаунта'}
                  </button>
               </div>
            </div>
         </div>
      </div>
   )
}
