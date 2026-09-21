'use client'

import type { AdminUser } from '@/types/admin'
import { UserRoleBadge, UserStatusBadge } from './UserBadges'
import { UserActionButtons } from './UserActionButtons'

interface UsersTableProps {
   users: AdminUser[]
   onEdit: (user: AdminUser) => void
   onToggleActive: (user: AdminUser) => void
}

export function UsersTable({ users, onEdit, onToggleActive }: UsersTableProps) {
   return (
      <div className="hidden md:block bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden shadow-2xs">
         <table className="w-full">
            <thead className="bg-[#FDFCFB] border-b border-[#E5E0D8]">
               <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#8B857D] uppercase">
                     Имя
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#8B857D] uppercase">
                     Логин
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#8B857D] uppercase">
                     Email
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#8B857D] uppercase">
                     Роль
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#8B857D] uppercase">
                     Статус
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-[#8B857D] uppercase">
                     Действия
                  </th>
               </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EDE8]">
               {users.map((user) => (
                  <tr
                     key={user.id}
                     className="hover:bg-[#FDFCFB]/50 transition-colors"
                  >
                     <td className="px-4 py-3 text-sm font-medium text-[#3E3A35]">
                        {user.name}
                     </td>
                     <td className="px-4 py-3 text-sm text-[#8B857D]">
                        {user.login}
                     </td>
                     <td className="px-4 py-3 text-sm text-[#8B857D]">
                        {user.email}
                     </td>
                     <td className="px-4 py-3">
                        <UserRoleBadge role={user.role} />
                     </td>
                     <td className="px-4 py-3">
                        <UserStatusBadge isActive={user.isActive} />
                     </td>
                     <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end">
                           <UserActionButtons
                              user={user}
                              onEdit={onEdit}
                              onToggleActive={onToggleActive}
                           />
                        </div>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
   )
}
