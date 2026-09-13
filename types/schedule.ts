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

export interface LessonOverride {
   id: string
   date: string | Date
   customTeacherName?: string | null
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
   totalLessons?: number | null
   color?: string | null
   customTeacherName?: string | null
   dayOfWeek?: string | null
   room?: string | null
   teacherId?: string | null
   teacher?: {
      id: string
      name: string
   } | null
   comments?: LessonComment[]
   cancellations?: LessonCancellation[]
   overrides?: LessonOverride[]
}

export interface FormDataState {
   subject: string
   comment: string
   date: string
   dayOfWeek: string
   startTime: string
   endTime: string
   room: string
   teacherId: string
   customTeacherName: string
   color: string
   totalLessons: string
}
