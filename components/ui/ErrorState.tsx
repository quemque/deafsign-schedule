'use client'

import { AlertCircle, RotateCcw } from 'lucide-react'

interface ErrorStateProps {
   message: string
   onRetry?: () => void
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
   return (
      <div className="flex-1 w-full flex flex-col items-center justify-center p-6 text-center bg-white rounded-2xl border border-red-100 shadow-2xs">
         <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mb-3">
            <AlertCircle className="w-6 h-6" />
         </div>
         <h3 className="text-sm font-bold text-[#3E3A35] mb-1">
            Не удалось загрузить данные
         </h3>
         <p className="text-xs text-[#8B857D] max-w-sm mb-4 leading-relaxed">
            {message}
         </p>
         {onRetry && (
            <button
               type="button"
               onClick={onRetry}
               className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#8BA888] text-white hover:bg-[#7A9A77] transition-colors shadow-2xs"
            >
               <RotateCcw className="w-3.5 h-3.5" />
               <span>Повторить запрос</span>
            </button>
         )}
      </div>
   )
}
