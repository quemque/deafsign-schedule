import { Calendar } from 'lucide-react'

export function LoginHeader() {
   return (
      <div className="text-center mb-8">
         <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#8BA888] text-white shadow-md shadow-[#8BA888]/20 mb-4">
            <Calendar className="w-8 h-8" />
         </div>
         <h1 className="text-2xl font-bold tracking-tight text-[#3E3A35]">
            DeafSign
         </h1>
         <p className="text-sm text-[#8B857D] mt-2">Войдите в свой аккаунт</p>
      </div>
   )
}
