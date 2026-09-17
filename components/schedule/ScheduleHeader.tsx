'use client'

import { Calendar, User as UserIcon, Shield } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function ScheduleHeader({ isAdmin }: { isAdmin: boolean }) {
   const router = useRouter()

   return (
      <header className="shrink-0 bg-[#FDFCFB]/90 backdrop-blur-md border-b border-[#E5E0D8] px-2.5 sm:px-4 py-1.5 sm:py-2 z-40">
         <div className="w-full max-w-[1600px] mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
               <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#8BA888] flex items-center justify-center text-white shrink-0">
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
               </div>
               <div>
                  <h1 className="text-xs sm:text-sm font-bold leading-tight text-[#3E3A35]">
                     Расписание
                  </h1>
                  <p className="text-[10px] sm:text-[11px] text-[#8B857D] leading-none">
                     Все занятия
                  </p>
               </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
               {isAdmin && (
                  <button
                     onClick={() => router.push('/admin')}
                     className="p-1.5 sm:px-3 sm:py-1.5 text-xs font-semibold bg-[#F5F2ED] hover:bg-[#EDE8E0] text-[#3E3A35] rounded-lg transition-colors flex items-center gap-1.5"
                  >
                     <Shield className="w-3.5 h-3.5 text-[#8BA888]" />
                     <span className="hidden sm:inline">Админ-панель</span>
                  </button>
               )}
               <button
                  onClick={() => router.push('/profile')}
                  className="p-1.5 sm:px-3 sm:py-1.5 text-xs font-semibold bg-[#F5F2ED] hover:bg-[#EDE8E0] text-[#3E3A35] rounded-lg flex items-center gap-1.5 transition-colors"
               >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Профиль</span>
               </button>
            </div>
         </div>
      </header>
   )
}
