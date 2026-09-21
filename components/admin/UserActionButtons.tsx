'use client'

import { Edit, UserCheck, UserX } from 'lucide-react'
import type { AdminUser } from '@/types/admin'

interface UserActionButtonsProps {
   user: AdminUser
   onEdit: (user: AdminUser) => void
   onToggleActive: (user: AdminUser) => void
}

export function UserActionButtons({
   user,
   onEdit,
   onToggleActive,
}: UserActionButtonsProps) {
   return (
      <div className="flex items-center gap-1.5">
         <button
            type="button"
            onClick={() => onToggleActive(user)}
            className={`p-1.5 rounded-lg transition-colors ${
               user.isActive
                  ? 'hover:bg-amber-50 text-amber-600'
                  : 'hover:bg-green-50 text-green-600'
            }`}
            title={user.isActive ? 'Деактивировать' : 'Активировать'}
            aria-label={user.isActive ? 'Деактивировать' : 'Активировать'}
         >
            {user.isActive ? (
               <UserX className="w-4 h-4" />
            ) : (
               <UserCheck className="w-4 h-4" />
            )}
         </button>

         <button
            type="button"
            onClick={() => onEdit(user)}
            className="p-1.5 rounded-lg hover:bg-[#F5F2ED] text-[#8B857D] transition-colors"
            title="Редактировать"
            aria-label="Редактировать"
         >
            <Edit className="w-4 h-4" />
         </button>
      </div>
   )
}
