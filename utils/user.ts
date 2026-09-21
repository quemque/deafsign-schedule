export function getRoleLabel(role: string): string {
   switch (role) {
      case 'ADMIN':
         return 'Администратор'
      case 'TEACHER':
         return 'Преподаватель'
      case 'USER':
         return 'Пользователь'
      default:
         return role
   }
}

export function getUserInitials(name: string): string {
   if (!name) return ''

   return name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
}
