import { describe, it, expect } from 'vitest'
import { computeWeekDates, formatWeekLabel } from '@/utils/weekSchedule'

describe('weekSchedule utils', () => {
   describe('computeWeekDates', () => {
      it('должен всегда возвращать ровно 7 дней недели начиная с понедельника', () => {
         const wednesday = new Date('2026-03-18T10:00:00Z')
         const week = computeWeekDates(wednesday)

         expect(week).toHaveLength(7)
         expect(week[0].key).toBe('MONDAY')
         expect(week[0].dateObj.getDate()).toBe(16)
         expect(week[6].key).toBe('SUNDAY')
         expect(week[6].dateObj.getDate()).toBe(22)
      })

      it('должен корректно находить понедельник, если переданное число — воскресенье', () => {
         const sunday = new Date('2026-03-22T15:00:00Z')
         const week = computeWeekDates(sunday)

         expect(week[0].key).toBe('MONDAY')
         expect(week[0].dateObj.getDate()).toBe(16)
         expect(week[6].key).toBe('SUNDAY')
         expect(week[6].dateObj.getDate()).toBe(22)
      })

      it('должен корректно обрабатывать переход между месяцами', () => {
         const firstOfApril = new Date('2026-04-01T12:00:00Z')
         const week = computeWeekDates(firstOfApril)

         expect(week[0].key).toBe('MONDAY')
         expect(week[0].dateObj.getMonth()).toBe(2)
         expect(week[0].dateObj.getDate()).toBe(30)

         expect(week[2].key).toBe('WEDNESDAY')
         expect(week[2].dateObj.getMonth()).toBe(3)
         expect(week[2].dateObj.getDate()).toBe(1)
      })
   })

   describe('formatWeekLabel', () => {
      it('должен форматировать диапазон внутри одного месяца', () => {
         const referenceDate = new Date('2026-03-18T10:00:00Z')
         const week = computeWeekDates(referenceDate)

         const label = formatWeekLabel(week)
         expect(label).toBe('16 – 22 марта 2026')
      })

      it('должен отображать оба месяца при переходе через границу месяца', () => {
         const referenceDate = new Date('2026-04-01T10:00:00Z')
         const week = computeWeekDates(referenceDate)

         const label = formatWeekLabel(week)
         expect(label).toBe('30 марта – 5 апреля 2026')
      })
   })
})
