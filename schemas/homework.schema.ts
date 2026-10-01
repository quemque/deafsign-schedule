import { z } from 'zod'

export const homeworkMediaItemSchema = z.object({
   id: z.string(),
   type: z.enum(['video', 'image']).default('video'),
   url: z.string().url(),
   key: z.string(),
   title: z.string().optional().nullable(),
})

export const homeworkQuerySchema = z.object({
   date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Неверный формат даты YYYY-MM-DD'),
})

export const deleteHomeworkQuerySchema = z.object({
   homeworkId: z.string().min(1, 'Идентификатор задания обязателен'),
})

export const createHomeworkSchema = z.object({
   date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Неверный формат даты YYYY-MM-DD'),
   title: z.string().trim().max(120).optional().nullable(),
   description: z.string().trim().min(1, 'Укажите текст задания'),
   videoUrl: z.string().url().optional().nullable(),
   videoKey: z.string().optional().nullable(),
   videos: z.array(homeworkMediaItemSchema).optional().nullable(),
   unlockDate: z.string().optional().nullable(),
   order: z.number().int().nonnegative().optional(),
})

export const updateHomeworkSchema = z.object({
   id: z.string().min(1),
   title: z.string().trim().max(120).optional().nullable(),
   description: z.string().trim().min(1, 'Укажите текст задания'),
   videoUrl: z.string().url().optional().nullable(),
   videoKey: z.string().optional().nullable(),
   videos: z.array(homeworkMediaItemSchema).optional().nullable(),
   unlockDate: z.string().optional().nullable(),
   order: z.number().int().nonnegative().optional(),
})

export const presignedUploadSchema = z.object({
   fileName: z.string().min(1),
   fileType: z.string().min(1),
   fileSize: z.number().max(500 * 1024 * 1024),
})

export type CreateHomeworkInput = z.infer<typeof createHomeworkSchema>
export type UpdateHomeworkInput = z.infer<typeof updateHomeworkSchema>
export type PresignedUploadInput = z.infer<typeof presignedUploadSchema>
