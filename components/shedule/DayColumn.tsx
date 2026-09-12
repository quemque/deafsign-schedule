'use client'

import { Clock } from 'lucide-react'
import { timeSlots } from '@/const/const'
import { ScheduleEvent } from '@/types/type'
import { getTypeBadgeStyle, getTypeLabel } from '@/lib/utils'

interface DayColumnProps {
   day: {
      name: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'
      label: string
      dateNumber: number
   }
   events: ScheduleEvent[]
   onEventClick: (event: ScheduleEvent) => void
   isToday: boolean
   currentTime: Date
}

export default function DayColumn({
   day,
   events,
   onEventClick,
   isToday,
   currentTime,
}: DayColumnProps) {
   const getCurrentTimePosition = () => {
      const hours = currentTime.getHours()
      const minutes = currentTime.getMinutes()
      const totalMinutes = hours * 60 + minutes
      const startMinutesFrom8 = totalMinutes - 8 * 60
      return (startMinutesFrom8 / 60) * 96
   }

   return (
      <div
         className={`relative min-h-[1440px] border-r border-[#F0EDE8] last:border-r-0 ${
            isToday ? 'bg-[#E8F0E8]/10' : 'bg-white'
         }`}
      >
         {timeSlots.map((time) => (
            <div
               key={time}
               className="h-24 border-b border-[#F0EDE8]/80 w-full"
            />
         ))}

         {isToday && (
            <div
               className="absolute left-0 right-0 z-10 flex items-center pointer-events-none"
               style={{ top: `${getCurrentTimePosition()}px` }}
            >
               <div className="w-2 h-2 rounded-full bg-[#C4A882] -ml-1 ring-4 ring-[#C4A882]/20" />
               <div className="flex-1 h-[2px] bg-[#C4A882]" />
            </div>
         )}

         {events.map((event) => {
            const [startHour, startMin] = event.startTime.split(':').map(Number)
            const [endHour, endMin] = event.endTime.split(':').map(Number)
            const startMinutesFrom8 = (startHour - 8) * 60 + startMin
            const durationMinutes =
               endHour * 60 + endMin - (startHour * 60 + startMin)
            const topPx = (startMinutesFrom8 / 60) * 96
            const heightPx = Math.max((durationMinutes / 60) * 96, 64)

            return (
               <div
                  key={event.id}
                  onClick={() => onEventClick(event)}
                  style={{ top: `${topPx}px`, height: `${heightPx}px` }}
                  className={`absolute left-1 right-1 rounded-xl p-2.5 border transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.99] flex flex-col justify-between overflow-hidden group ${event.colorTheme.bg} ${event.colorTheme.border}`}
               >
                  <div>
                     <div className="flex items-center justify-between gap-1 mb-1">
                        <span
                           className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md border ${getTypeBadgeStyle(event.type)}`}
                        >
                           {getTypeLabel(event.type)}
                        </span>
                        <span className="text-[10px] font-medium text-[#8B857D] flex items-center gap-0.5">
                           <Clock className="w-3 h-3" /> {event.startTime}
                        </span>
                     </div>
                     <h3
                        className={`text-xs font-bold leading-snug line-clamp-2 ${event.colorTheme.text}`}
                     >
                        {event.title}
                     </h3>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#8B857D] pt-1 border-t border-[#E5E0D8]/50 mt-1">
                     <span className="truncate max-w-[80%] font-medium">
                        {event.instructor}
                     </span>
                     <span className="group-hover:translate-x-0.5 transition-transform">
                        →
                     </span>
                  </div>
               </div>
            )
         })}
      </div>
   )
}
