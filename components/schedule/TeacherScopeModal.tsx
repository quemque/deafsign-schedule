'use client'

interface TeacherScopeModalProps {
   isOpen: boolean
   onClose: () => void
   onConfirm: (scope: 'this' | 'all') => void
}

export function TeacherScopeModal({
   isOpen,
   onClose,
   onConfirm,
}: TeacherScopeModalProps) {
   if (!isOpen) return null

   return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-[#2C2824]/50 backdrop-blur-xs animate-in fade-in">
         <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-[#E5E0D8] shadow-2xl relative">
            <h3 className="font-bold text-base text-[#3E3A35] mb-2">
               Изменение преподавателя
            </h3>

            <p className="text-xs text-[#8B857D] mb-5 leading-relaxed">
               Применить нового преподавателя только для выбранного дня или для
               всех занятий курса?
            </p>

            <div className="flex flex-col gap-2">
               <button
                  type="button"
                  onClick={() => onConfirm('this')}
                  className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl bg-[#F5F2ED] hover:bg-[#EDE8E0] text-[#3E3A35] transition-colors"
               >
                  Только на это занятие
               </button>

               <button
                  type="button"
                  onClick={() => onConfirm('all')}
                  className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl bg-[#8BA888] hover:bg-[#7A9A77] text-white shadow-sm shadow-[#8BA888]/20 transition-colors"
               >
                  На все занятия курса
               </button>

               <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl border border-[#E5E0D8] text-[#8B857D] hover:bg-gray-50 transition-colors"
               >
                  Отмена
               </button>
            </div>
         </div>
      </div>
   )
}
