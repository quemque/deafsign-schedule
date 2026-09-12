'use client'

import { useState, useEffect } from 'react'
import { daysOfWeek, timeSlots } from '@/const/const'
import { ScheduleEvent } from '@/types/type'
import { getDayShortLabel, getDayFullLabel } from '@/lib/utils'
import DayColumn from './DayColumn'
import MobileDayView from './MobileDayView'

interface ScheduleGridProps {
   events: ScheduleEvent[]
   onEventClick: (event: ScheduleEvent) => void
   currentTime: Date
}

export default function ScheduleGrid({
   events,
   onEventClick,
   currentTime,
}: ScheduleGridProps) {
   const [isMobile, setIsMobile] = useState(false)
   const [selectedDay, setSelectedDay] = useState<string>('Mon')

   useEffect(() => {
      const checkMobile = () => {
         setIsMobile(window.innerWidth < 768)
      }
      checkMobile()
      window.addEventListener('resize', checkMobile)
      return () => window.removeEventListener('resize', checkMobile)
   }, [])

   const getCurrentDayName = () => {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      return days[currentTime.getDay()]
   }

   if (isMobile) {
      return (
         <MobileDayView
            daysOfWeek={daysOfWeek}
            selectedDay={selectedDay}
            onDayChange={setSelectedDay}
            events={events}
            onEventClick={onEventClick}
            currentTime={currentTime}
            getCurrentDayName={getCurrentDayName}
         />
      )
   }

   return (
      <div className="bg-white rounded-2xl border border-[#E5E0D8] shadow-sm overflow-hidden flex flex-col">
         <div className="grid grid-cols-8 border-b border-[#E5E0D8] bg-[#FDFCFB]/70 text-center">
            <div className="py-3 px-2 border-r border-[#E5E0D8] flex items-center justify-center text-[11px] font-semibold text-[#B0A89E] uppercase tracking-wider">
               Время
            </div>
            {daysOfWeek.map((day) => {
               const isToday = day.name === getCurrentDayName()
               return (
                  <div
                     key={day.name}
                     className={`py-3 px-2 border-r border-[#E5E0D8] last:border-r-0 flex flex-col items-center justify-center ${
                        isToday ? 'bg-[#E8F0E8]/60' : ''
                     }`}
                  >
                     <span className="text-xs font-medium text-[#8B857D]">
                        {getDayShortLabel(day.name)}
                     </span>
                     <div
                        className={`mt-1 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                           isToday
                              ? 'bg-[#8BA888] text-white shadow-sm shadow-[#8BA888]/30'
                              : 'text-[#3E3A35] bg-white border border-[#E5E0D8]'
                        }`}
                     >
                        {day.dateNumber}
                     </div>
                  </div>
               )
            })}
         </div>

         <div className="grid grid-cols-8 relative divide-x divide-[#F0EDE8] bg-white">
            <div className="bg-[#FDFCFB]/40 flex flex-col text-right pr-3 select-none">
               {timeSlots.map((time) => (
                  <div
                     key={time}
                     className="h-24 border-b border-[#F0EDE8] text-[11px] text-[#B0A89E] font-medium pt-2 pr-2"
                  >
                     {time}
                  </div>
               ))}
            </div>

            {daysOfWeek.map((day) => (
               <DayColumn
                  key={day.name}
                  day={day}
                  events={events.filter((e) => e.day === day.name)}
                  onEventClick={onEventClick}
                  isToday={day.name === getCurrentDayName()}
                  currentTime={currentTime}
               />
            ))}
         </div>
      </div>
   )
}
