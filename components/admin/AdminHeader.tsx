'use client'

import { Shield, ArrowLeft, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function AdminHeader() {
   const router = useRouter()

   const handleLogout = async () => {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
   }

   return (
      <header className="sticky top-0 z-30 bg-[#FDFCFB]/90 backdrop-blur-md border-b border-[#E5E0D8] px-3 sm:px-6 py-2.5 sm:py-3 shrink-0">
         <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
               <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="p-1.5 sm:p-2 rounded-xl hover:bg-[#F5F2ED] text-[#8B857D] transition-colors shrink-0"
                  title="К расписанию"
                  aria-label="К расписанию"
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
                  type="button"
                  onClick={() => router.push('/')}
                  className="hidden md:flex px-3 py-1.5 text-xs font-semibold bg-[#F5F2ED] border border-[#E5E0D8] rounded-xl hover:bg-[#EDE8E0] items-center gap-1.5 transition-colors"
               >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>К расписанию</span>
               </button>

               <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 sm:px-3 sm:py-1.5 text-xs font-semibold bg-[#F5F2ED] border border-[#E5E0D8] rounded-xl hover:bg-[#EDE8E0] flex items-center gap-1.5 transition-colors text-red-600"
                  title="Выйти"
                  aria-label="Выйти"
               >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Выйти</span>
               </button>
            </div>
         </div>
      </header>
   )
}
