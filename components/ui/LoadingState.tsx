import { Loader2 } from 'lucide-react'

interface LoadingStateProps {
   message?: string
   variant?: 'full' | 'section'
   className?: string
}

export function LoadingState({
   message = 'Загрузка...',
   variant = 'full',
   className = '',
}: LoadingStateProps) {
   const containerStyles =
      variant === 'full'
         ? 'flex-1 flex flex-col items-center justify-center p-4'
         : 'py-12 flex flex-col items-center justify-center'

   return (
      <div className={`${containerStyles} ${className}`.trim()}>
         <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 text-[#8BA888] animate-spin mb-2" />
         <span className="text-xs sm:text-sm text-[#8B857D] font-medium">
            {message}
         </span>
      </div>
   )
}
