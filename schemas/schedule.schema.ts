import { z } from 'zod'
import { DayOfWeek } from '@prisma/client'

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/

export const createLessonSchema = z.object({
   subject: z
      .string()
      .trim()
      .min(1, 'Укажите название предмета')
      .max(150, 'Название предмета слишком длинное'),
   teacherId: z.string().cuid().nullable().optional(),
   customTeacherName: z.string().trim().max(255).nullable().optional(),
   teacherByDay: z
      .record(z.string(), z.union([z.string(), z.array(z.string())]))
      .nullable()
      .optional(),
   timeByDay: z
      .record(
         z.string(),
         z.object({
            startTime: z
               .string()
               .regex(timeRegex, 'Неверный формат времени начала'),
            endTime: z
               .string()
               .regex(timeRegex, 'Неверный формат времени окончания'),
         }),
      )
      .nullable()
      .optional(),
   color: z
      .string()
      .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Неверный формат цвета')
      .optional(),
   totalLessons: z
      .union([z.number().int().positive(), z.string()])
      .transform((val) => (val ? Number(val) : null))
      .nullable()
      .optional(),
   isRecurring: z.boolean().default(false),
   date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Дата должна быть в формате YYYY-MM-DD')
      .optional(),
   dayOfWeek: z.nativeEnum(DayOfWeek).nullable().optional(),
   daysOfWeek: z.array(z.nativeEnum(DayOfWeek)).optional(),
   startTime: z.string().regex(timeRegex, 'Неверный формат времени').optional(),
   endTime: z.string().regex(timeRegex, 'Неверный формат времени').optional(),
   startsAt: z.string().datetime().optional(),
   endsAt: z.string().datetime().optional(),
})

export const rescheduleLessonSchema = z.object({
   action: z.literal('reschedule'),
   originalDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Дата должна быть в формате YYYY-MM-DD'),
   newDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Дата должна быть в формате YYYY-MM-DD'),
   newStartTime: z.string().regex(timeRegex, 'Неверный формат времени начала'),
   newEndTime: z.string().regex(timeRegex, 'Неверный формат времени окончания'),
})

export const updateLessonSchema = z.object({
   action: z.undefined().optional(),
   teacherScope: z.enum(['this', 'all']).optional(),
   activeDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
   subject: z.string().trim().min(1).max(150),
   teacherId: z.string().cuid().nullable().optional(),
   customTeacherName: z.string().trim().max(255).nullable().optional(),
   teacherByDay: z
      .record(z.string(), z.union([z.string(), z.array(z.string())]))
      .nullable()
      .optional(),
   timeByDay: z
      .record(
         z.string(),
         z.object({
            startTime: z.string().regex(timeRegex),
            endTime: z.string().regex(timeRegex),
         }),
      )
      .nullable()
      .optional(),
   color: z.string().optional(),
   daysOfWeek: z.array(z.nativeEnum(DayOfWeek)).optional(),
   dayOfWeek: z.nativeEnum(DayOfWeek).optional(),
   totalLessons: z
      .union([z.number().int().positive(), z.string()])
      .transform((val) => (val ? Number(val) : null))
      .nullable()
      .optional(),
   startsAt: z.string().datetime().optional(),
   endsAt: z.string().datetime().optional(),
})

export const patchLessonSchema = z.union([
   rescheduleLessonSchema,
   updateLessonSchema,
])

export const deleteLessonQuerySchema = z.object({
   mode: z.enum(['this', 'future', 'all']).default('all'),
   date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Некорректная дата')
      .optional(),
})

export const scheduleListQuerySchema = z.object({
   startDate: z.string().datetime().optional(),
   endDate: z.string().datetime().optional(),
})

export const lessonCommentSchema = z.object({
   date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Дата должна быть в формате YYYY-MM-DD'),
   text: z.string().trim().max(1000, 'Текст комментария слишком длинный'),
})

export type CreateLessonInput = z.infer<typeof createLessonSchema>
export type PatchLessonInput = z.infer<typeof patchLessonSchema>
