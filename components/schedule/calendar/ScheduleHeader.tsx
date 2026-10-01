'use client'

import { Calendar, User as UserIcon, Shield } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ScheduleHeaderProps {
   isAdmin: boolean
}

export function ScheduleHeader({ isAdmin }: ScheduleHeaderProps) {
   const router = useRouter()

   return (
      <header className="relative z-40 shrink-0 border-b border-[#E5E0D8] bg-[#FDFCFB]/95 px-3 py-2.5 backdrop-blur-md sm:px-5">
         <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
               <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#8BA888] text-white shadow-sm shadow-[#536F52]/20 sm:h-10 sm:w-10">
                  <Calendar
                     className="h-[18px] w-[18px] sm:h-5 sm:w-5"
                     strokeWidth={1.8}
                  />
               </div>
               <div className="min-w-0">
                  <h1 className="text-sm font-bold leading-tight tracking-[-0.02em] text-[#3E3A35] sm:text-base">
                     Расписание
                  </h1>
                  <p className="mt-0.5 text-[11px] leading-tight text-[#8B857D] sm:text-xs">
                     Все занятия
                  </p>
               </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
               {isAdmin && (
                  <button
                     type="button"
                     onClick={() => router.push('/admin')}
                     className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E5E0D8] bg-white/70 p-2 text-xs font-semibold text-[#3E3A35] transition-colors hover:border-[#C8D4C5] hover:bg-[#F3F6F1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6E8B6A] focus-visible:ring-offset-2 sm:px-3"
                  >
                     <Shield
                        className="h-4 w-4 text-[#6F8D6B]"
                        strokeWidth={1.8}
                     />
                     <span className="hidden sm:inline">Админ-панель</span>
                  </button>
               )}
               <button
                  type="button"
                  onClick={() => router.push('/profile')}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E5E0D8] bg-white/70 p-2 text-xs font-semibold text-[#3E3A35] transition-colors hover:border-[#C8D4C5] hover:bg-[#F3F6F1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6E8B6A] focus-visible:ring-offset-2 sm:px-3"
               >
                  <UserIcon
                     className="h-4 w-4 text-[#6F8D6B]"
                     strokeWidth={1.8}
                  />
                  <span className="hidden sm:inline">Профиль</span>
               </button>
            </div>
         </div>
      </header>
   )
}
