'use client'

import { Clock, User as UserIcon } from 'lucide-react'
import { formatUtcTime } from '@/utils/lesson'
import { TeacherName } from '@/components/schedule/calendar/TeacherName'

interface InfoGridProps {
   baseColor: string
   startsAt: Date | string
   endsAt: Date | string
   teacherName?: string
}

export function LessonInfoGrid({
   baseColor,
   startsAt,
   endsAt,
   teacherName,
}: InfoGridProps) {
   return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
         <div className="flex items-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl bg-[#FDFCFB] border border-[#F0EDE8]">
            <div
               style={{ color: baseColor }}
               className="p-1.5 sm:p-2 rounded-lg bg-white shadow-xs shrink-0"
            >
               <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0">
               <span className="block text-[9px] sm:text-[11px] font-medium text-[#B0A89E] uppercase">
                  Время
               </span>
               <span className="text-[11px] sm:text-xs font-bold text-[#3E3A35] truncate block">
                  {formatUtcTime(new Date(startsAt))} –{' '}
                  {formatUtcTime(new Date(endsAt))}
               </span>
            </div>
         </div>

         <div className="flex items-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl bg-[#FDFCFB] border border-[#F0EDE8]">
            <div
               style={{ color: teacherName ? baseColor : undefined }}
               className={`p-1.5 sm:p-2 rounded-lg bg-white shadow-xs shrink-0 ${
                  !teacherName ? 'text-gray-400' : ''
               }`}
            >
               <UserIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0">
               <span className="block text-[9px] sm:text-[11px] font-medium text-[#B0A89E] uppercase">
                  Преподаватель
               </span>
               <span className="text-[11px] sm:text-xs font-bold text-[#3E3A35] block min-w-0">
                  <TeacherName
                     fullName={teacherName}
                     fallbackText="Не назначен"
                  />
               </span>
            </div>
         </div>
      </div>
   )
}
