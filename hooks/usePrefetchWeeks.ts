'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { scheduleApi } from '@/services/scheduleApi'
import { getWeekRangeParams } from '@/utils/scheduleTime'

export function usePrefetchWeeks(currentDate: Date) {
   const queryClient = useQueryClient()

   useEffect(() => {
      const prevDate = new Date(currentDate)
      prevDate.setDate(prevDate.getDate() - 7)
      const prevParams = getWeekRangeParams(prevDate)

      const nextDate = new Date(currentDate)
      nextDate.setDate(nextDate.getDate() + 7)
      const nextParams = getWeekRangeParams(nextDate)

      queryClient.prefetchQuery({
         queryKey: queryKeys.schedule.list(prevParams),
         queryFn: () => scheduleApi.getLessons(prevParams),
         staleTime: 1000 * 60 * 5,
      })

      queryClient.prefetchQuery({
         queryKey: queryKeys.schedule.list(nextParams),
         queryFn: () => scheduleApi.getLessons(nextParams),
         staleTime: 1000 * 60 * 5,
      })
   }, [currentDate, queryClient])
}
