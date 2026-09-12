export default function labelDay(day: string | null | undefined): string {
   if (!day) return ''
   const map: Record<string, string> = {
      MONDAY: 'Пн',
      TUESDAY: 'Вт',
      WEDNESDAY: 'Ср',
      THURSDAY: 'Чт',
      FRIDAY: 'Пт',
      SATURDAY: 'Сб',
      SUNDAY: 'Вс',
   }
   return map[day] || day
}
