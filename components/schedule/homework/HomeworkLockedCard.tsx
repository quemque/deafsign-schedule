'use client'

import { Lock, Calendar } from 'lucide-react'
import type { Homework } from '@/types/schedule'

interface LockedCardProps {
   item: Homework
   index: number
}

export function HomeworkLockedCard({ item, index }: LockedCardProps) {
   return (
      <div className="p-3.5 rounded-2xl border border-dashed border-[#E5E0D8] bg-[#FDFCFB] flex items-center gap-3 text-[#8B857D]">
         <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
            <Lock className="w-4 h-4" />
         </div>
         <div className="flex flex-col">
            <span className="text-xs font-semibold text-[#3E3A35]">
               {item.title || `Задание ${index + 1}`}
            </span>
            <span className="text-[10px] text-[#8B857D] flex items-center gap-1 mt-0.5">
               <Calendar className="w-3 h-3" />
               Откроется:{' '}
               {item.unlockDate
                  ? new Date(item.unlockDate).toLocaleString('ru-RU', {
                       day: 'numeric',
                       month: 'long',
                       hour: '2-digit',
                       minute: '2-digit',
                    })
                  : 'по расписанию'}
            </span>
         </div>
      </div>
   )
}
