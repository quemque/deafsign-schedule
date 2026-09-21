'use client'

import { Mail } from 'lucide-react'
import type { AdminUser } from '@/types/admin'
import { UserRoleBadge, UserStatusBadge } from './UserBadges'
import { UserActionButtons } from './UserActionButtons'

interface UsersMobileListProps {
   users: AdminUser[]
   onEdit: (user: AdminUser) => void
   onToggleActive: (user: AdminUser) => void
}

export function UsersMobileList({
   users,
   onEdit,
   onToggleActive,
}: UsersMobileListProps) {
   return (
      <div className="md:hidden space-y-2.5">
         {users.map((user) => (
            <div
               key={user.id}
               className="bg-white rounded-2xl border border-[#E5E0D8] p-3.5 shadow-2xs space-y-2.5"
            >
               <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                     <h3 className="text-xs font-bold text-[#3E3A35] truncate">
                        {user.name}
                     </h3>
                     <p className="text-[11px] text-[#8B857D] font-mono truncate">
                        @{user.login}
                     </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                     <UserRoleBadge role={user.role} />
                     <UserStatusBadge isActive={user.isActive} />
                  </div>
               </div>

               <div className="flex items-center gap-1.5 text-[11px] text-[#8B857D] truncate">
                  <Mail className="w-3 h-3 shrink-0 opacity-60" />
                  <span className="truncate">{user.email}</span>
               </div>

               <div className="pt-2 border-t border-[#F0EDE8] flex items-center justify-end">
                  <UserActionButtons
                     user={user}
                     onEdit={onEdit}
                     onToggleActive={onToggleActive}
                  />
               </div>
            </div>
         ))}
      </div>
   )
}
