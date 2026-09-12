'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
   Calendar,
   User,
   LogOut,
   Settings,
   Shield,
   ChevronDown,
} from 'lucide-react'
import { useUser } from '@/hooks/useUser'

export default function Header() {
   const router = useRouter()
   const { user, loading } = useUser()
   const [isOpen, setIsOpen] = useState(false)
   const dropdownRef = useRef<HTMLDivElement>(null)

   useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
         if (
            dropdownRef.current &&
            !dropdownRef.current.contains(e.target as Node)
         ) {
            setIsOpen(false)
         }
      }
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
   }, [])

   const handleLogout = async () => {
      await fetch('/api/auth/logout', { method: 'POST' })
      setIsOpen(false)
      router.push('/login')
      router.refresh()
   }

   const getInitials = (name: string) => {
      return name
         .split(' ')
         .map((n) => n[0])
         .slice(0, 2)
         .join('')
         .toUpperCase()
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
      <header className="sticky top-0 z-30 bg-[#FDFCFB]/90 backdrop-blur-md border-b border-[#E5E0D8] px-4 lg:px-8 py-3 transition-all">
         <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <Link href="/schedule" className="flex items-center gap-2 sm:gap-3">
               <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#8BA888] flex items-center justify-center text-white shadow-sm shadow-[#8BA888]/20">
                  <Calendar className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
               </div>
               <div>
                  <h1 className="text-sm sm:text-base font-semibold tracking-tight text-[#3E3A35]">
                     DeafSign
                  </h1>
                  <p className="text-[10px] sm:text-[11px] text-[#8B857D] hidden sm:block">
                     Расписание занятий
                  </p>
               </div>
            </Link>

            <div className="relative" ref={dropdownRef}>
               <button
                  onClick={() => setIsOpen(!isOpen)}
                  title="Профиль"
                  className="flex items-center gap-2 p-1 pr-2 sm:pr-3 rounded-xl bg-[#F5F2ED] border border-[#E5E0D8] hover:bg-[#EDE8E0] hover:border-[#D5CEC2] transition-all shadow-xs"
               >
                  {user ? (
                     <>
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#8BA888] flex items-center justify-center text-white text-xs font-semibold">
                           {getInitials(user.name)}
                        </div>
                        <span className="hidden sm:block text-xs font-medium text-[#3E3A35] max-w-[100px] truncate">
                           {user.name.split(' ')[0]}
                        </span>
                        <ChevronDown
                           className={`w-3.5 h-3.5 text-[#8B857D] transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        />
                     </>
                  ) : (
                     <>
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#F5F2ED] flex items-center justify-center text-[#5A7A5A]">
                           <User className="w-4 h-4" />
                        </div>
                        <span className="hidden sm:block text-xs font-medium text-[#5A534A]">
                           Войти
                        </span>
                     </>
                  )}
               </button>

               {isOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl border border-[#E5E0D8] shadow-lg shadow-[#8B857D]/10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                     {user ? (
                        <>
                           <div className="p-4 border-b border-[#F0EDE8]">
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-xl bg-[#8BA888] flex items-center justify-center text-white text-sm font-semibold shrink-0">
                                    {getInitials(user.name)}
                                 </div>
                                 <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-[#3E3A35] truncate">
                                       {user.name}
                                    </p>
                                    <p className="text-[11px] text-[#8B857D] truncate">
                                       {user.email}
                                    </p>
                                 </div>
                              </div>
                              <div className="mt-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E8F0E8] border border-[#C8D6C8]">
                                 <span className="w-1.5 h-1.5 rounded-full bg-[#8BA888]" />
                                 <span className="text-[10px] font-medium text-[#5A7A5A]">
                                    {getRoleLabel(user.role)}
                                 </span>
                              </div>
                           </div>

                           <div className="p-2">
                              {user.role === 'ADMIN' && (
                                 <Link
                                    href="/admin"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-[#5A534A] hover:bg-[#F5F2ED] transition-colors"
                                 >
                                    <Shield className="w-4 h-4 text-[#8B857D]" />
                                    Админ-панель
                                 </Link>
                              )}
                              <Link
                                 href="/profile"
                                 onClick={() => setIsOpen(false)}
                                 className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-[#5A534A] hover:bg-[#F5F2ED] transition-colors"
                              >
                                 <Settings className="w-4 h-4 text-[#8B857D]" />
                                 Настройки профиля
                              </Link>
                           </div>

                           <div className="p-2 border-t border-[#F0EDE8]">
                              <button
                                 onClick={handleLogout}
                                 className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                              >
                                 <LogOut className="w-4 h-4" />
                                 Выйти
                              </button>
                           </div>
                        </>
                     ) : (
                        <div className="p-4 text-center">
                           <p className="text-xs text-[#8B857D] mb-3">
                              Войдите, чтобы получить доступ
                           </p>
                           <Link
                              href="/login"
                              onClick={() => setIsOpen(false)}
                              className="block w-full py-2 px-4 bg-[#8BA888] hover:bg-[#7A9A77] text-white text-xs font-semibold rounded-xl transition-all"
                           >
                              Войти
                           </Link>
                        </div>
                     )}
                  </div>
               )}
            </div>
         </div>
      </header>
   )
}
