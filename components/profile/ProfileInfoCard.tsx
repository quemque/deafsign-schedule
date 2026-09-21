import type { ReactNode } from 'react'

interface ProfileInfoCardProps {
   icon: ReactNode
   label: string
   value: string
}

export function ProfileInfoCard({ icon, label, value }: ProfileInfoCardProps) {
   return (
      <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FDFCFB] border border-[#F0EDE8]">
         <div className="text-[#5A7A5A] shrink-0">{icon}</div>
         <div className="min-w-0">
            <span className="block text-[10px] uppercase text-[#B0A89E] font-medium leading-none mb-1">
               {label}
            </span>
            <span className="text-sm font-semibold text-[#3E3A35] truncate block">
               {value}
            </span>
         </div>
      </div>
   )
}
