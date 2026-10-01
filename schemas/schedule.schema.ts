import { z } from 'zod'

export const dayOfWeekSchema = z.enum([
   'MONDAY',
   'TUESDAY',
   'WEDNESDAY',
   'THURSDAY',
   'FRIDAY',
   'SATURDAY',
   'SUNDAY',
])

export const mediaTypeSchema = z.enum(['video', 'image'])

export const homeworkMediaItemSchema = z.object({
   id: z.string(),
   type: mediaTypeSchema.default('video'),
   url: z.string().url(),
   key: z.string(),
   title: z.string().optional().nullable(),
})

export const scheduleListQuerySchema = z.object({
   startDate: z.string().optional(),
   endDate: z.string().optional(),
})

export const deleteLessonQuerySchema = z
   .object({
      mode: z.enum(['this', 'future', 'all']).default('all'),
      date: z
         .string()
         .optional()
         .nullable()
         .transform((val) => {
            if (!val || val === 'undefined' || val === 'null') return undefined
            if (val.includes('T')) return val.split('T')[0]
            return val
         }),
   })
   .refine(
      (data) => {
         if (data.mode !== 'all') {
            return Boolean(data.date && /^\d{4}-\d{2}-\d{2}$/.test(data.date))
         }
         if (data.date) {
            return /^\d{4}-\d{2}-\d{2}$/.test(data.date)
         }
         return true
      },
      {
         message:
            'Для выбранного режима требуется корректная дата (YYYY-MM-DD)',
         path: ['date'],
      },
   )

export const dayTimeSlotSchema = z.object({
   startTime: z.string().optional(),
   endTime: z.string().optional(),
})

export const createLessonSchema = z.object({
   subject: z.string().trim().min(1, 'Укажите предмет или группу'),
   date: z.string().optional(),
   startTime: z.string().optional(),
   endTime: z.string().optional(),
   startsAt: z.string().optional(),
   endsAt: z.string().optional(),
   color: z.string().optional().nullable(),
   customTeacherName: z.string().optional().nullable(),
   totalLessons: z
      .union([z.number(), z.string()])
      .optional()
      .nullable()
      .transform((val) => {
         if (!val) return null
         const num = Number(val)
         return isNaN(num) ? null : num
      }),
   isRecurring: z.boolean().default(false),
   dayOfWeek: dayOfWeekSchema.or(z.string()).optional().nullable(),
   daysOfWeek: z.array(dayOfWeekSchema.or(z.string())).optional().default([]),
   teacherByDay: z.record(z.string(), z.any()).optional().nullable(),
   timeByDay: z.record(z.string(), dayTimeSlotSchema).optional().nullable(),
   teacherId: z.string().optional().nullable(),
   scheduleId: z.string().optional().nullable(),
})

export const updateLessonSchema = createLessonSchema.partial().extend({
   teacherScope: z.enum(['this', 'all']).optional(),
   activeDate: z.string().optional(),
})

export const rescheduleLessonSchema = z.object({
   originalDate: z.string().min(1, 'Исходная дата обязательна'),
   newDate: z.string().min(1, 'Новая дата обязательна'),
   newStartTime: z.string().regex(/^\d{2}:\d{2}$/, 'Формат: HH:mm'),
   newEndTime: z.string().regex(/^\d{2}:\d{2}$/, 'Формат: HH:mm'),
})

export const lessonCommentSchema = z.object({
   date: z.string().min(1, 'Дата обязательна'),
   text: z.string().optional().default(''),
})

export const saveCommentSchema = lessonCommentSchema

export type DayOfWeekType = z.infer<typeof dayOfWeekSchema>
export type MediaType = z.infer<typeof mediaTypeSchema>
export type HomeworkMediaItem = z.infer<typeof homeworkMediaItemSchema>
export type ScheduleListQueryParams = z.infer<typeof scheduleListQuerySchema>
export type DeleteLessonQueryParams = z.infer<typeof deleteLessonQuerySchema>
export type CreateLessonInput = z.infer<typeof createLessonSchema>
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>
export type RescheduleLessonInput = z.infer<typeof rescheduleLessonSchema>
export type LessonCommentInput = z.infer<typeof lessonCommentSchema>
export type SaveCommentInput = z.infer<typeof saveCommentSchema>
