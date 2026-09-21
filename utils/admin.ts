export function getRoleBadgeClass(role: string): string {
   switch (role) {
      case 'ADMIN':
         return 'bg-purple-100 text-purple-700'
      case 'TEACHER':
         return 'bg-[#E0E8E0] text-[#4A674A]'
      default:
         return 'bg-[#E0E5E8] text-[#4A5867]'
   }
}
