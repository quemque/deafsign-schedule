'use client'

import { Clock, User, MapPin, X, Sparkles } from 'lucide-react'
import type { ScheduleEvent } from '@/types/type'
import { getTypeBadgeStyle, getTypeLabel, getDayFullLabel } from '@/lib/utils'

interface EventModalProps {
   event: ScheduleEvent
   onClose: () => void
}

export default function EventModal({ event, onClose }: EventModalProps) {
   return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-[#2C2824]/40 backdrop-blur-xs animate-in fade-in duration-200">
         <div
            className="bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl border border-[#E5E0D8] w-full max-w-lg overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
         >
            <div
               className={`p-4 sm:p-6 border-b ${event.colorTheme.bg} ${event.colorTheme.border} relative`}
            >
               <button
                  onClick={onClose}
                  className="absolute top-3 sm:top-4 right-3 sm:right-4 p-2 rounded-full bg-white/80 hover:bg-white text-[#8B857D] hover:text-[#3E3A35] shadow-xs transition-colors"
               >
                  <X className="w-4 h-4" />
               </button>

               <div className="flex items-center gap-2 mb-2 flex-wrap pr-8">
                  <span
                     className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getTypeBadgeStyle(event.type)}`}
                  >
                     {getTypeLabel(event.type).toUpperCase()}
                  </span>
                  <span className="text-xs font-medium text-[#8B857D] bg-white/60 px-2.5 py-1 rounded-full border border-[#E5E0D8]">
                     {getDayFullLabel(event.day)}, {event.dateNumber} октября
                  </span>
               </div>

               <h2 className="text-lg sm:text-xl font-extrabold text-[#3E3A35] pr-8">
                  {event.title}
               </h2>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 max-h-[70vh] overflow-y-auto">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-[#FDFCFB] border border-[#F0EDE8]">
                     <div className="p-2 rounded-lg bg-white shadow-xs text-[#5A7A5A]">
                        <Clock className="w-4 h-4" />
                     </div>
                     <div>
                        <span className="block text-[11px] font-medium text-[#B0A89E] uppercase">
                           Время занятия
                        </span>
                        <span className="text-xs font-bold text-[#3E3A35]">
                           {event.timeString}
                        </span>
                     </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-[#FDFCFB] border border-[#F0EDE8]">
                     <div className="p-2 rounded-lg bg-white shadow-xs text-[#5A7A5A]">
                        <MapPin className="w-4 h-4" />
                     </div>
                     <div>
                        <span className="block text-[11px] font-medium text-[#B0A89E] uppercase">
                           Место проведения
                        </span>
                        <span className="text-xs font-bold text-[#3E3A35]">
                           {event.location}
                        </span>
                     </div>
                  </div>
               </div>

               <div className="flex items-start gap-3 p-3 rounded-xl bg-[#FDFCFB] border border-[#F0EDE8]">
                  <div className="p-2 rounded-lg bg-white shadow-xs text-[#5A7A5A]">
                     <User className="w-4 h-4" />
                  </div>
                  <div>
                     <span className="block text-[11px] font-medium text-[#B0A89E] uppercase">
                        Преподаватель / Ведущий
                     </span>
                     <span className="text-xs font-bold text-[#3E3A35]">
                        {event.instructor}
                     </span>
                  </div>
               </div>

               <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#B0A89E] mb-2">
                     Комментарий
                  </h4>
                  <p className="text-sm text-[#5A534A] leading-relaxed bg-[#FDFCFB]/50 p-4 rounded-xl border border-[#F0EDE8]">
                     {event.description}
                  </p>
               </div>

               <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                     onClick={onClose}
                     className="px-4 py-2 text-xs font-semibold bg-[#F5F2ED] hover:bg-[#EDE8E0] text-[#5A534A] rounded-xl transition-colors"
                  >
                     Закрыть
                  </button>
               </div>
            </div>
         </div>
      </div>
   )
}
