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

export interface LessonCancellation {
   id: string
   date: string | Date
   reason?: string | null
   lessonId: string
}

export type DeleteLessonMode = 'this' | 'future' | 'all'

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
   endDate?: string | null
   isRecurring: boolean
   dayOfWeek?: string | null
   room?: string | null
   teacher?: {
      id: string
      name: string
   } | null
   comments?: LessonComment[]
   cancellations?: LessonCancellation[]
}
