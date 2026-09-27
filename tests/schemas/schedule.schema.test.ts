import { describe, it, expect } from 'vitest'
import {
   createLessonSchema,
   rescheduleLessonSchema,
} from '@/schemas/schedule.schema'

describe('Schedule Schemas Validation', () => {
   describe('createLessonSchema', () => {
      it('должен успешно валидировать корректный разовый урок', () => {
         const validPayload = {
            subject: 'Русский жестовый язык',
            color: '#8BA888',
            date: '2026-03-20',
            startTime: '14:00',
            endTime: '15:30',
            isRecurring: false,
         }

         const result = createLessonSchema.safeParse(validPayload)
         expect(result.success).toBe(true)
      })

      it('должен отклонять пустое или состоящее из пробелов название предмета', () => {
         const invalidPayload = {
            subject: '   ',
            date: '2026-03-20',
            startTime: '14:00',
            endTime: '15:30',
         }

         const result = createLessonSchema.safeParse(invalidPayload)
         expect(result.success).toBe(false)
         if (!result.success) {
            expect(result.error.issues[0].message).toBe(
               'Укажите название предмета',
            )
         }
      })

      it('должен отклонять некорректный формат времени', () => {
         const invalidPayload = {
            subject: 'Лекция',
            date: '2026-03-20',
            startTime: '25:00',
            endTime: '14:65',
         }

         const result = createLessonSchema.safeParse(invalidPayload)
         expect(result.success).toBe(false)
      })

      it('должен преобразовывать строковый totalLessons в число', () => {
         const payload = {
            subject: 'Курс РЖЯ',
            totalLessons: '12',
            isRecurring: true,
         }

         const result = createLessonSchema.safeParse(payload)
         expect(result.success).toBe(true)
         if (result.success) {
            expect(result.data.totalLessons).toBe(12)
         }
      })
   })

   describe('rescheduleLessonSchema', () => {
      it('должен отклонять перенос, если action не равен reschedule', () => {
         const invalidPayload = {
            action: 'update',
            originalDate: '2026-03-20',
            newDate: '2026-03-22',
            newStartTime: '10:00',
            newEndTime: '11:30',
         }

         const result = rescheduleLessonSchema.safeParse(invalidPayload)
         expect(result.success).toBe(false)
      })

      it('должен пропускать валидный запрос на перенос', () => {
         const validPayload = {
            action: 'reschedule',
            originalDate: '2026-03-20',
            newDate: '2026-03-22',
            newStartTime: '10:00',
            newEndTime: '11:30',
         }

         const result = rescheduleLessonSchema.safeParse(validPayload)
         expect(result.success).toBe(true)
      })
   })
})
