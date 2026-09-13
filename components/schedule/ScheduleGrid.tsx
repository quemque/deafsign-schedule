'use client'

import { Clock } from 'lucide-react'
import type { ApiLesson } from '@/types/schedule'
import { TIME_SLOTS } from '@/constants/schedule'
import { LessonCard } from './LessonCard'
import { isLessonActiveOnDate } from '@/utils/date'

interface DayItem {
   key: string
   label: string
   short: string
   dateObj: Date
   dateNumber: number
   isToday: boolean
}

interface ScheduleGridProps {
   weekDates: DayItem[]
   currentDate: Date
   currentTime: Date
   visibleLessons: ApiLesson[]
   onSelectDate: (date: Date) => void
   onSelectLesson: (lesson: ApiLesson, dayDate: Date) => void
}

export function ScheduleGrid({
   weekDates,
   currentDate,
   currentTime,
   visibleLessons,
   onSelectDate,
   onSelectLesson,
}: ScheduleGridProps) {
   const getCurrentTimePosition = () => {
      const hours = currentTime.getHours()
      const minutes = currentTime.getMinutes()
      const startMinutesFrom8 = hours * 60 + minutes - 8 * 60
      return (startMinutesFrom8 / 60) * 96
   }

   return (
      <div className="flex-1 bg-white rounded-2xl border border-[#E5E0D8] shadow-sm flex flex-col overflow-hidden">
         <div className="flex-1 overflow-auto w-full relative custom-scrollbar bg-white">
            <div className="min-w-full relative">
               <div className="grid grid-cols-[50px_1fr] sm:grid-cols-[60px_repeat(7,1fr)] sticky top-0 z-40 bg-[#FDFCFB]/95 backdrop-blur-md shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  <div className="border-b border-r border-[#E5E0D8] sticky left-0 z-50 bg-[#FDFCFB]/95 backdrop-blur-md flex flex-col items-center justify-center py-2 sm:py-3 text-[10px] sm:text-[11px] font-semibold text-[#B0A89E] uppercase tracking-wider">
                     <Clock className="w-3.5 h-3.5 mb-0.5 opacity-60" />
                     Время
                  </div>
                  {weekDates.map((day) => {
                     const isSelected =
                        day.dateObj.toDateString() ===
                        currentDate.toDateString()
                     return (
                        <div
                           key={day.key}
                           onClick={() => onSelectDate(day.dateObj)}
                           className={`py-2 sm:py-3 px-1 sm:px-2 border-b border-r border-[#E5E0D8] last:border-r-0 flex-col items-center justify-center cursor-pointer transition-colors ${
                              isSelected ? 'flex' : 'hidden sm:flex'
                           } ${day.isToday ? 'bg-[#E8F0E8]/60' : 'hover:bg-[#F5F2ED]/40'}`}
                        >
                           <span className="text-[11px] sm:text-xs font-medium text-[#8B857D]">
                              {day.label}
                           </span>
                           <div
                              className={`mt-1 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-bold ${
                                 day.isToday
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

               <div className="grid grid-cols-[50px_1fr] sm:grid-cols-[60px_repeat(7,1fr)] relative min-h-[1440px]">
                  <div className="bg-[#FDFCFB] flex flex-col text-right select-none sticky left-0 z-30 border-r border-[#E5E0D8]">
                     {TIME_SLOTS.map((time) => (
                        <div
                           key={time}
                           className="h-24 border-b border-[#F0EDE8] text-[10px] sm:text-[11px] text-[#B0A89E] font-medium pt-1 sm:pt-2 pr-1 sm:pr-2 bg-[#FDFCFB]"
                        >
                           {time}
                        </div>
                     ))}
                  </div>

                  {weekDates.map((day) => {
                     const isSelected =
                        day.dateObj.toDateString() ===
                        currentDate.toDateString()

                     const dayKeyDate = `${day.dateObj.getFullYear()}-${String(day.dateObj.getMonth() + 1).padStart(2, '0')}-${String(day.dateObj.getDate()).padStart(2, '0')}`

                     const dayLessons = visibleLessons.filter((l) => {
                        const matchesDay = l.isRecurring
                           ? l.dayOfWeek === day.key
                           : new Date(l.startsAt)
                                .toISOString()
                                .split('T')[0] === dayKeyDate

                        if (!matchesDay) return false
                        return isLessonActiveOnDate(l, day.dateObj)
                     })

                     return (
                        <div
                           key={day.key}
                           className={`relative border-r border-[#F0EDE8] last:border-r-0 ${
                              isSelected ? 'block' : 'hidden sm:block'
                           } ${day.isToday ? 'bg-[#E8F0E8]/10' : 'bg-white'}`}
                        >
                           {TIME_SLOTS.map((time) => (
                              <div
                                 key={time}
                                 className="h-24 border-b border-[#F0EDE8]/80 w-full"
                              />
                           ))}

                           {day.isToday && (
                              <div
                                 className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
                                 style={{
                                    top: `${getCurrentTimePosition()}px`,
                                 }}
                              >
                                 <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#8BA888] -ml-[3px] sm:-ml-1 ring-4 ring-[#8BA888]/20" />
                                 <div className="flex-1 h-[2px] bg-[#8BA888]/70" />
                              </div>
                           )}

                           {dayLessons.map((lesson) => (
                              <LessonCard
                                 key={lesson.id}
                                 lesson={lesson}
                                 dayDate={day.dateObj}
                                 onClick={() =>
                                    onSelectLesson(lesson, day.dateObj)
                                 }
                              />
                           ))}
                        </div>
                     )
                  })}
               </div>
            </div>
         </div>
      </div>
   )
}
