'use client'

import { Calendar, User as UserIcon, Shield } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function ScheduleHeader({ isAdmin }: { isAdmin: boolean }) {
   const router = useRouter()

   return (
      <header className="shrink-0 bg-[#FDFCFB]/90 backdrop-blur-md border-b border-[#E5E0D8] px-4 lg:px-8 py-3 z-40">
         <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
               <div className="w-9 h-9 rounded-xl bg-[#8BA888] flex items-center justify-center text-white shrink-0">
                  <Calendar className="w-4 h-4" />
               </div>
               <div>
                  <h1 className="text-sm font-semibold">Расписание</h1>
                  <p className="text-[11px] text-[#8B857D]">Все занятия</p>
               </div>
            </div>
            <div className="flex items-center gap-2">
               {isAdmin && (
                  <button
                     onClick={() => router.push('/admin')}
                     className="p-2 sm:px-4 sm:py-2 text-xs font-semibold bg-[#F5F2ED] hover:bg-[#EDE8E0] text-[#3E3A35] rounded-xl transition-colors flex items-center gap-2"
                  >
                     <Shield className="w-4 h-4 text-[#8BA888]" />
                     <span className="hidden sm:inline">Админ панель</span>
                  </button>
               )}
               <button
                  onClick={() => router.push('/profile')}
                  className="p-2 sm:px-4 sm:py-2 text-xs font-semibold bg-[#F5F2ED] hover:bg-[#EDE8E0] text-[#3E3A35] rounded-xl flex items-center gap-2 transition-colors"
               >
                  <UserIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Профиль</span>
               </button>
            </div>
         </div>
      </header>
   )
}
