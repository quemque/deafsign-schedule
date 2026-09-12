import { ScheduleEvent } from '@/types/type'
import { daysOfWeek } from '@/const/const'

export const filterEvents = (
   events: ScheduleEvent[],
   filterType: string,
   searchQuery: string,
) => {
   return events.filter((event) => {
      const matchesType = filterType === 'all' || event.type === filterType
      const matchesSearch =
         event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
         event.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
         event.description.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesType && matchesSearch
   })
}

export const getTypeBadgeStyle = (type: string) => {
   switch (type) {
      case 'lecture':
         return 'bg-[#E0E8E0] text-[#4A674A] border-[#C8D6C8]'
      case 'workshop':
         return 'bg-[#E8E0D6] text-[#675A4A] border-[#D6C8BC]'
      case 'lab':
         return 'bg-[#E0E5E8] text-[#4A5867] border-[#C8D0D6]'
      case 'office-hours':
         return 'bg-[#E8DCC8] text-[#675A40] border-[#D6C8B4]'
      case 'seminar':
         return 'bg-[#E8E0E0] text-[#674A4A] border-[#D6C8C8]'
      case 'project':
         return 'bg-[#E0E0E8] text-[#4A4A67] border-[#C8C8D6]'
      default:
         return 'bg-gray-100 text-gray-700 border-gray-200'
   }
}

export const getTypeLabel = (type: string) => {
   const labels: Record<string, string> = {
      lecture: 'лекция',
      workshop: 'практикум',
      lab: 'лаборатория',
      'office-hours': 'консультация',
      seminar: 'семинар',
      project: 'проект',
   }
   return labels[type] || type
}

export const getDayShortLabel = (dayName: string) => {
   const day = daysOfWeek.find((d) => d.name === dayName)
   if (!day) return dayName

   const shortLabels: Record<string, string> = {
      Mon: 'Пн',
      Tue: 'Вт',
      Wed: 'Ср',
      Thu: 'Чт',
      Fri: 'Пт',
      Sat: 'Сб',
      Sun: 'Вс',
   }
   return shortLabels[day.name] || day.label.slice(0, 2)
}

export const getDayFullLabel = (dayName: string) => {
   const day = daysOfWeek.find((d) => d.name === dayName)
   return day ? day.label : dayName
}
