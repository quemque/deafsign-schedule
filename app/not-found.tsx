import Link from 'next/link'
import { CalendarX, ArrowLeft } from 'lucide-react'

export default function NotFound() {
   return (
      <div className="min-h-screen bg-[#FAF8F5] text-[#3E3A35] font-sans flex items-center justify-center p-4 selection:bg-[#8BA888] selection:text-white">
         <div className="w-full max-w-md bg-white rounded-3xl border border-[#E5E0D8] shadow-sm p-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-[#E8F0E8] border border-[#8BA888]/30 flex items-center justify-center text-[#8BA888] mb-6 shadow-sm shadow-[#8BA888]/10">
               <CalendarX className="w-8 h-8" />
            </div>

            <span className="text-xs font-bold uppercase tracking-wider text-[#8BA888] mb-2 bg-[#E8F0E8] px-3 py-1 rounded-full">
               Ошибка 404
            </span>

            <h1 className="text-2xl font-extrabold text-[#3E3A35] mb-2">
               Страница не найдена
            </h1>

            <Link
               href="/"
               className="w-full py-3 px-5 text-xs font-semibold bg-[#8BA888] hover:bg-[#7A9A77] text-white rounded-xl shadow-sm shadow-[#8BA888]/20 transition-all flex items-center justify-center gap-2"
            >
               <ArrowLeft className="w-4 h-4" />
               Вернуться к расписанию
            </Link>
         </div>
      </div>
   )
}
