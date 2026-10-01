'use client'

import { MessageSquare } from 'lucide-react'

interface CommentSectionProps {
   canEdit: boolean
   text: string
   onChange: (val: string) => void
   onSave: () => void
}

export function LessonCommentSection({
   canEdit,
   text,
   onChange,
   onSave,
}: CommentSectionProps) {
   return (
      <div>
         <h4 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#B0A89E] mb-1.5 sm:mb-2 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" /> Заметка для преподавателей
         </h4>

         {canEdit ? (
            <div className="flex flex-col gap-2">
               <textarea
                  value={text}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder="Добавить внутреннюю заметку..."
                  className="w-full bg-[#FDFCFB] border border-[#F0EDE8] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm resize-none focus:outline-none focus:border-[#8BA888]"
                  rows={3}
               />
               <button
                  type="button"
                  onClick={onSave}
                  className="self-end px-4 py-1.5 text-xs font-semibold bg-[#F5F2ED] hover:bg-[#EDE8E0] text-[#3E3A35] border border-[#E5E0D8] transition-colors rounded-lg"
               >
                  Сохранить заметку
               </button>
            </div>
         ) : (
            <p className="text-[11px] sm:text-sm text-[#5A534A] leading-relaxed bg-[#FDFCFB]/50 p-2.5 sm:p-4 rounded-xl border border-[#F0EDE8] whitespace-pre-wrap">
               {text || 'Нет заметок'}
            </p>
         )}
      </div>
   )
}
