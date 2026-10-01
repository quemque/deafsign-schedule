'use client'

interface ModeSelectorProps {
   mode: 'once' | 'weekly'
   onModeChange: (mode: 'once' | 'weekly') => void
}

export function ModeSelector({ mode, onModeChange }: ModeSelectorProps) {
   const getButtonClassName = (active: boolean) =>
      `flex-1 py-2 text-[11px] sm:text-xs font-semibold rounded-xl border transition-all ${
         active
            ? 'bg-[#8BA888] text-white border-[#8BA888] shadow-sm shadow-[#8BA888]/20'
            : 'bg-[#F5F2ED] text-[#5A534A] border-[#E5E0D8] hover:bg-[#EDE8E0]'
      }`

   return (
      <div className="flex gap-2 mb-5">
         <button
            type="button"
            onClick={() => onModeChange('once')}
            className={getButtonClassName(mode === 'once')}
         >
            Разовое
         </button>
         <button
            type="button"
            onClick={() => onModeChange('weekly')}
            className={getButtonClassName(mode === 'weekly')}
         >
            Каждую неделю
         </button>
      </div>
   )
}
