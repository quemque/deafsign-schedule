interface TeacherNameProps {
   fullName?: string
   fallbackText?: string
}

export function TeacherName({
   fullName,
   fallbackText = 'Без преподавателя',
}: TeacherNameProps) {
   if (!fullName) {
      return <span className="opacity-50 italic">{fallbackText}</span>
   }

   const parts = fullName.trim().split(/\s+/)
   const [lastName, ...rest] = parts

   return (
      <span className="truncate">
         <span className="text-red-500 font-bold">{lastName}</span>
         {rest.length > 0 ? ` ${rest.join(' ')}` : ''}
      </span>
   )
}
