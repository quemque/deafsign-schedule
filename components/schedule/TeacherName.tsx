interface TeacherNameProps {
   fullName?: string
   fallbackText?: string
   className?: string
}

export function TeacherName({
   fullName,
   fallbackText = 'Без преподавателя',
   className = '',
}: TeacherNameProps) {
   if (!fullName) {
      return <span className="opacity-50 italic">{fallbackText}</span>
   }

   const teachers = fullName
      .split(/[,/]/)
      .map((item) => item.trim())
      .filter(Boolean)

   if (teachers.length === 0) {
      return <span className="opacity-50 italic">{fallbackText}</span>
   }

   return (
      <span className={`flex flex-col gap-0.5 min-w-0 ${className}`}>
         {teachers.map((teacher, index) => {
            const parts = teacher.split(/\s+/)
            const lastName = parts[0]
            const rest = parts.slice(1).join(' ')

            return (
               <span key={index} className="truncate block leading-tight">
                  <span className="text-red-500 font-bold">{lastName}</span>
                  {rest ? ` ${rest}` : ''}
               </span>
            )
         })}
      </span>
   )
}
