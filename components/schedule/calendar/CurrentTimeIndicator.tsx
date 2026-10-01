'use client'

interface CurrentTimeIndicatorProps {
   position: number
}

export function CurrentTimeIndicator({ position }: CurrentTimeIndicatorProps) {
   return (
      <div
         className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
         style={{ top: `${position}px` }}
      >
         <div className="w-1.5 h-1.5 rounded-full bg-[#8BA888] -ml-[3px] ring-2 ring-[#8BA888]/20" />
         <div className="flex-1 h-[1.5px] bg-[#8BA888]/70" />
      </div>
   )
}
