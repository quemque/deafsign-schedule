'use client'

import { Clock, MapPin, User } from 'lucide-react'
import type { ScheduleEvent } from '@/types/type'
import {
   getTypeBadgeStyle,
   getTypeLabel,
   getDayShortLabel,
   getDayFullLabel,
} from '@/lib/utils'

interface MobileDayViewProps {
   daysOfWeek: Array<{
      name: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'
      label: string
      dateNumber: number
   }>
   selectedDay: string
   onDayChange: (day: string) => void
   events: ScheduleEvent[]
   onEventClick: (event: ScheduleEvent) => void
   currentTime: Date
   getCurrentDayName: () => string
}

export default function MobileDayView({
   daysOfWeek,
   selectedDay,
   onDayChange,
   events,
   onEventClick,
   currentTime,
   getCurrentDayName,
}: MobileDayViewProps) {
   const dayEvents = events
      .filter((e) => e.day === selectedDay)
      .sort((a, b) => {
         const timeA = a.startTime.split(':').map(Number)
         const timeB = b.startTime.split(':').map(Number)
         return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1])
      })

   const selectedDayInfo = daysOfWeek.find((d) => d.name === selectedDay)

   return (
      <div className="space-y-4">
         <div className="bg-white rounded-2xl border border-[#E5E0D8] shadow-sm p-4">
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
               {daysOfWeek.map((day) => {
                  const isToday = day.name === getCurrentDayName()
                  const isSelected = day.name === selectedDay
                  return (
                     <button
                        key={day.name}
                        onClick={() => onDayChange(day.name)}
                        className={`flex-shrink-0 w-14 py-2 rounded-xl border transition-all ${
                           isSelected
                              ? 'bg-[#8BA888] text-white border-[#8BA888] shadow-sm'
                              : isToday
                                ? 'bg-[#E8F0E8] text-[#3E3A35] border-[#C8D6C8]'
                                : 'bg-white text-[#3E3A35] border-[#E5E0D8]'
                        }`}
                     >
                        <span className="block text-[10px] font-medium opacity-80">
                           {getDayShortLabel(day.name)}
                        </span>
                        <span className="block text-sm font-bold">
                           {day.dateNumber}
                        </span>
                     </button>
                  )
               })}
            </div>
         </div>

         {selectedDayInfo && (
            <div className="bg-white rounded-2xl border border-[#E5E0D8] shadow-sm p-4">
               <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-[#3E3A35]">
                     {getDayFullLabel(selectedDayInfo.name)}
                  </h2>
                  <span className="text-xs text-[#8B857D]">
                     {dayEvents.length} занятий
                  </span>
               </div>

               {dayEvents.length === 0 ? (
                  <div className="text-center py-8 text-[#B0A89E] text-xs">
                     Нет занятий в этот день
                  </div>
               ) : (
                  <div className="space-y-3">
                     {dayEvents.map((event) => (
                        <button
                           key={event.id}
                           onClick={() => onEventClick(event)}
                           className={`w-full text-left p-4 rounded-xl border transition-all ${event.colorTheme.bg} ${event.colorTheme.border}`}
                        >
                           <div className="flex items-start justify-between mb-2">
                              <span
                                 className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getTypeBadgeStyle(event.type)}`}
                              >
                                 {getTypeLabel(event.type)}
                              </span>
                              <span className="text-xs font-medium text-[#5A534A] flex items-center gap-1">
                                 <Clock className="w-3 h-3" />
                                 {event.timeString}
                              </span>
                           </div>
                           <h3
                              className={`text-sm font-bold mb-2 ${event.colorTheme.text}`}
                           >
                              {event.title}
                           </h3>
                           <div className="flex items-center gap-3 text-[11px] text-[#8B857D]">
                              <span className="flex items-center gap-1">
                                 <User className="w-3 h-3" />
                                 {event.instructor}
                              </span>
                              <span className="flex items-center gap-1">
                                 <MapPin className="w-3 h-3" />
                                 {event.location}
                              </span>
                           </div>
                        </button>
                     ))}
                  </div>
               )}
            </div>
         )}
      </div>
   )
}
