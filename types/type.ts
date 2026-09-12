export interface ScheduleEvent {
   id: string
   title: string
   day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'
   dateNumber: number
   startTime: string
   endTime: string
   timeString: string
   type: 'lecture' | 'workshop' | 'lab' | 'office-hours' | 'seminar' | 'project'
   instructor: string
   location: string
   description: string
   colorTheme: {
      bg: string
      border: string
      text: string
      badgeBg: string
      badgeText: string
   }
}

export interface ApiLesson {
   id: string
   subject: string
   teacherId: string | null
   teacher: { id: string; name: string } | null
   room: string | null
   startsAt: string
   endsAt: string
   comment: string | null
   isRecurring: boolean
   dayOfWeek: string | null
}
