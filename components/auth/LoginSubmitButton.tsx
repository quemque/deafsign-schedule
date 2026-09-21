import { ArrowRight } from 'lucide-react'

interface LoginSubmitButtonProps {
   isLoading: boolean
}

export function LoginSubmitButton({ isLoading }: LoginSubmitButtonProps) {
   return (
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
   )
}
