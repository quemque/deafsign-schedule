'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, User, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'

export default function LoginPage() {
   const router = useRouter()
   const [login, setLogin] = useState('')
   const [password, setPassword] = useState('')
   const [showPassword, setShowPassword] = useState(false)
   const [isLoading, setIsLoading] = useState(false)
   const [error, setError] = useState('')

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setError('')
      setIsLoading(true)

      try {
         const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ login, password }),
         })

         const data = await res.json()

         if (!res.ok) {
            setError(data.error || 'Ошибка входа')
            return
         }

         if (data.user.role === 'ADMIN') {
            router.push('/admin')
         } else {
            router.push('/schedule')
         }
      } catch {
         setError('Ошибка соединения')
      } finally {
         setIsLoading(false)
      }
   }

   return (
      <div className="min-h-screen bg-[#FAF8F5] text-[#3E3A35] font-sans antialiased flex flex-col selection:bg-[#8BA888] selection:text-white">
         <div className="flex-1 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
               <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#8BA888] text-white shadow-md shadow-[#8BA888]/20 mb-4">
                     <Calendar className="w-8 h-8" />
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight text-[#3E3A35]">
                     DeafSign
                  </h1>
                  <p className="text-sm text-[#8B857D] mt-2">
                     Войдите в свой аккаунт
                  </p>
               </div>

               <div className="bg-white rounded-2xl border border-[#E5E0D8] shadow-sm p-6 sm:p-8">
                  <form onSubmit={handleSubmit} className="space-y-5">
                     <div>
                        <label className="block text-xs font-medium text-[#5A534A] mb-2">
                           Логин или Email
                        </label>
                        <div className="relative">
                           <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B0A89E]" />
                           <input
                              type="text"
                              value={login}
                              onChange={(e) => setLogin(e.target.value)}
                              placeholder="admin или admin@deafsign.ru"
                              required
                              className="w-full bg-[#F5F2ED]/70 border border-[#E5E0D8] rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8BA888]/20 focus:border-[#8BA888] transition-all"
                           />
                        </div>
                     </div>

                     <div>
                        <label className="block text-xs font-medium text-[#5A534A] mb-2">
                           Пароль
                        </label>
                        <div className="relative">
                           <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B0A89E]" />
                           <input
                              type={showPassword ? 'text' : 'password'}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="Введите пароль"
                              required
                              className="w-full bg-[#F5F2ED]/70 border border-[#E5E0D8] rounded-xl pl-10 pr-12 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8BA888]/20 focus:border-[#8BA888] transition-all"
                           />
                           <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B0A89E] hover:text-[#5A534A]"
                           >
                              {showPassword ? (
                                 <EyeOff className="w-4 h-4" />
                              ) : (
                                 <Eye className="w-4 h-4" />
                              )}
                           </button>
                        </div>
                     </div>

                     {error && (
                        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                           {error}
                        </div>
                     )}

                     <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-2.5 px-4 bg-[#8BA888] hover:bg-[#7A9A77] text-white text-sm font-semibold rounded-xl shadow-md shadow-[#8BA888]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                     >
                        {isLoading ? (
                           <>
                              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Входим...
                           </>
                        ) : (
                           <>
                              Войти <ArrowRight className="w-4 h-4" />
                           </>
                        )}
                     </button>
                  </form>
               </div>
            </div>
         </div>
      </div>
   )
}
