'use client'

import { User, Lock, Eye, EyeOff } from 'lucide-react'

interface LoginFormFieldsProps {
   login: string
   password: string
   showPassword: boolean
   onLoginChange: (value: string) => void
   onPasswordChange: (value: string) => void
   onToggleShowPassword: () => void
}

export function LoginFormFields({
   login,
   password,
   showPassword,
   onLoginChange,
   onPasswordChange,
   onToggleShowPassword,
}: LoginFormFieldsProps) {
   return (
      <>
         <div>
            <label className="block text-xs font-medium text-[#5A534A] mb-2">
               Логин или Email
            </label>
            <div className="relative">
               <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B0A89E]" />
               <input
                  type="text"
                  value={login}
                  onChange={(e) => onLoginChange(e.target.value)}
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
                  onChange={(e) => onPasswordChange(e.target.value)}
                  placeholder="Введите пароль"
                  required
                  className="w-full bg-[#F5F2ED]/70 border border-[#E5E0D8] rounded-xl pl-10 pr-12 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8BA888]/20 focus:border-[#8BA888] transition-all"
               />
               <button
                  type="button"
                  onClick={onToggleShowPassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B0A89E] hover:text-[#5A534A] transition-colors"
                  aria-label={
                     showPassword ? 'Скрыть пароль' : 'Показать пароль'
                  }
               >
                  {showPassword ? (
                     <EyeOff className="w-4 h-4" />
                  ) : (
                     <Eye className="w-4 h-4" />
                  )}
               </button>
            </div>
         </div>
      </>
   )
}
