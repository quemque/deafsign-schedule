export interface Teacher {
   id: string
   name: string
}

export interface CurrentUser {
   id: string
   name: string
   role: 'ADMIN' | 'TEACHER' | 'USER'
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
