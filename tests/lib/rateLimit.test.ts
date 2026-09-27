import { describe, it, expect, vi, beforeEach } from 'vitest'
import { rateLimit } from '@/lib/rateLimit'

describe('rateLimit', () => {
   beforeEach(() => {
      vi.useFakeTimers()
   })

   it('должен разрешать запросы в пределах установленного лимита', () => {
      const limiter = rateLimit({
         interval: 60000,
         uniqueTokenPerInterval: 100,
      })
      const token = 'client-ip-1'

      const r1 = limiter.check(3, token)
      const r2 = limiter.check(3, token)
      const r3 = limiter.check(3, token)

      expect(r1.success).toBe(true)
      expect(r2.success).toBe(true)
      expect(r3.success).toBe(true)
      expect(r3.remaining).toBe(0)
   })

   it('должен блокировать запросы, превышающие установленный лимит', () => {
      const limiter = rateLimit({
         interval: 60000,
         uniqueTokenPerInterval: 100,
      })
      const token = 'client-ip-2'

      limiter.check(2, token)
      limiter.check(2, token)
      const blocked = limiter.check(2, token)

      expect(blocked.success).toBe(false)
      expect(blocked.remaining).toBe(0)
   })

   it('должен сбрасывать лимит по истечении заданного интервала времени', () => {
      const limiter = rateLimit({
         interval: 60000,
         uniqueTokenPerInterval: 100,
      })
      const token = 'client-ip-3'

      limiter.check(1, token)
      expect(limiter.check(1, token).success).toBe(false)

      vi.advanceTimersByTime(60001)

      const afterReset = limiter.check(1, token)
      expect(afterReset.success).toBe(true)
      expect(afterReset.remaining).toBe(0)
   })
})
