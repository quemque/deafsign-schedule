'use client'

import { Calendar, CalendarDays } from 'lucide-react'

interface MobileViewToggleProps {
   mode: 'day' | 'week'
   onChange: (mode: 'day' | 'week') => void
}

export function MobileViewToggle({ mode, onChange }: MobileViewToggleProps) {
   const getButtonClassName = (isActive: boolean) =>
      `p-1 rounded-md transition-all ${
         isActive
            ? 'bg-white text-[#3E3A35] shadow-xs'
            : 'text-[#8B857D] hover:text-[#3E3A35]'
      }`

   return (
      <div className="flex sm:hidden items-center bg-[#F5F2ED] p-0.5 rounded-lg shrink-0">
         <button
            type="button"
            onClick={() => onChange('day')}
            className={getButtonClassName(mode === 'day')}
            title="Режим дня"
            aria-label="Режим дня"
         >
            <Calendar className="w-3.5 h-3.5" />
         </button>
         <button
            type="button"
            onClick={() => onChange('week')}
            className={getButtonClassName(mode === 'week')}
            title="Режим недели"
            aria-label="Режим недели"
         >
            <CalendarDays className="w-3.5 h-3.5" />
         </button>
      </div>
   )
}
