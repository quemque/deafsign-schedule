import { z } from 'zod'

export const homeworkQuerySchema = z.object({
   date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Неверный формат даты YYYY-MM-DD'),
})

export const saveHomeworkSchema = z.object({
   date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Неверный формат даты YYYY-MM-DD'),
   title: z.string().trim().max(120).optional().nullable(),
   description: z.string().trim().min(1, 'Укажите текст задания'),
   videoUrl: z.string().url().optional().nullable(),
   videoKey: z.string().optional().nullable(),
})

export const presignedUploadSchema = z.object({
   fileName: z.string().min(1),
   fileType: z.string().min(1),
   fileSize: z.number().max(500 * 1024 * 1024),
})

export type SaveHomeworkInput = z.infer<typeof saveHomeworkSchema>
export type PresignedUploadInput = z.infer<typeof presignedUploadSchema>
