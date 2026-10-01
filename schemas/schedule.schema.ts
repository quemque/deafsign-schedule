import { z } from 'zod'

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
   dayOfWeek: z.string().optional().nullable(),
   daysOfWeek: z.array(z.string()).optional().default([]),
   teacherByDay: z.record(z.string(), z.any()).optional().nullable(),
   timeByDay: z.record(z.string(), z.any()).optional().nullable(),
   teacherId: z
      .string()
      .optional()
      .nullable()
      .transform((val) => (val && val.trim() ? val.trim() : null)),
   scheduleId: z
      .string()
      .optional()
      .nullable()
      .transform((val) => (val && val.trim() ? val.trim() : null)),
})

export const updateLessonSchema = createLessonSchema.partial().extend({
   teacherScope: z.enum(['this', 'all']).optional(),
   activeDate: z.string().optional(),
})

export type DeleteLessonQueryInput = z.infer<typeof deleteLessonQuerySchema>
export type CreateLessonInput = z.infer<typeof createLessonSchema>
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>
