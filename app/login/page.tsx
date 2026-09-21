'use client'

import { useLoginForm } from '@/hooks/useLoginForm'
import { LoginHeader } from '@/components/auth/LoginHeader'
import { LoginFormFields } from '@/components/auth/LoginFormFields'
import { LoginSubmitButton } from '@/components/auth/LoginSubmitButton'

export default function LoginPage() {
   const {
      login,
      setLogin,
      password,
      setPassword,
      showPassword,
      toggleShowPassword,
      isLoading,
      error,
      handleSubmit,
   } = useLoginForm()

   return (
      <div className="min-h-screen bg-[#FAF8F5] text-[#3E3A35] font-sans antialiased flex flex-col selection:bg-[#8BA888] selection:text-white">
         <div className="flex-1 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
               <LoginHeader />

               <div className="bg-white rounded-2xl border border-[#E5E0D8] shadow-sm p-6 sm:p-8">
                  <form onSubmit={handleSubmit} className="space-y-5">
                     <LoginFormFields
                        login={login}
                        password={password}
                        showPassword={showPassword}
                        onLoginChange={setLogin}
                        onPasswordChange={setPassword}
                        onToggleShowPassword={toggleShowPassword}
                     />

                     {error && (
                        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                           {error}
                        </div>
                     )}

                     <LoginSubmitButton isLoading={isLoading} />
                  </form>
               </div>
            </div>
         </div>
      </div>
   )
}
