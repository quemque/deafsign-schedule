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

export interface LessonReschedule {
   id: string
   originalDate: string | Date
   newStartsAt: string | Date
   newEndsAt: string | Date
   lessonId: string
}

export interface HomeworkVideoItem {
   id: string
   url: string
   key: string
   title?: string
}

export interface Homework {
   id: string
   date: string | Date
   title?: string | null
   description: string
   videoUrl?: string | null
   videoKey?: string | null
   videos?: HomeworkVideoItem[] | null
   order: number
   unlockDate?: string | Date | null
   lessonId: string
   authorId: string
   author?: {
      id: string
      name: string
   }
   createdAt: string | Date
   updatedAt: string | Date
}

export type DeleteLessonMode = 'this' | 'future' | 'all'

export interface CurrentUser {
   id: string
   name: string
   role: 'ADMIN' | 'TEACHER' | 'USER'
}

export interface DayTimeSlot {
   startTime: string
   endTime: string
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
   teacherByDay?: Record<string, string> | null
   timeByDay?: Record<string, DayTimeSlot> | null
   dayOfWeek?: string | null
   daysOfWeek?: string[]
   room?: string | null
   teacherId?: string | null
   teacher?: {
      id: string
      name: string
   } | null
   comments?: LessonComment[]
   cancellations?: LessonCancellation[]
   overrides?: LessonOverride[]
   reschedules?: LessonReschedule[]
   homeworks?: Homework[]
}

export interface FormDataState {
   subject: string
   date: string
   startTime: string
   endTime: string
   color: string
   customTeacherName: string
   totalLessons: string
   dayOfWeek: string
   daysOfWeek: string[]
   teacherByDay?: Record<string, string[] | string>
   timeByDay?: Record<string, { startTime: string; endTime: string }>
}
