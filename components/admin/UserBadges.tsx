import { getRoleBadgeClass } from '@/utils/admin'

export function UserRoleBadge({ role }: { role: string }) {
   return (
      <span
         className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${getRoleBadgeClass(
            role,
         )}`}
      >
         {role}
      </span>
   )
}

export function UserStatusBadge({ isActive }: { isActive: boolean }) {
   return (
      <span
         className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
            isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
         }`}
      >
         {isActive ? 'Активен' : 'Отключён'}
      </span>
   )
}
