export interface Teacher {
   id: string
   name: string
}

export interface LessonComment {
   id: string
   text: string
   date: string | Date
   lessonId: string
   authorId: string
}

export interface CurrentUser {
   id: string
   name: string
   role: 'ADMIN' | 'TEACHER' | 'USER'
}
export interface ApiLesson {
   id: string
   subject: string
   startsAt: string
   endsAt: string
   isRecurring: boolean
   dayOfWeek?: string | null
   room?: string | null
   teacher?: {
      id: string
      name: string
   } | null
   comments?: LessonComment[]
}
