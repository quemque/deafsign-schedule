'use client'

interface TimeGutterProps {
   timeSlots: string[]
   hourHeight: number
}

export function TimeGutter({ timeSlots, hourHeight }: TimeGutterProps) {
   return (
      <div className="bg-[#FDFCFB] flex flex-col text-right select-none sticky left-0 z-30 border-r border-[#E5E0D8]">
         {timeSlots.map((time) => (
            <div
               key={time}
               style={{ height: `${hourHeight}px` }}
               className="border-b border-[#F0EDE8] text-[8px] sm:text-[10px] text-[#B0A89E] font-medium pt-0.5 pr-1 sm:pr-1.5 bg-[#FDFCFB]"
            >
               {time}
            </div>
         ))}
      </div>
   )
}
