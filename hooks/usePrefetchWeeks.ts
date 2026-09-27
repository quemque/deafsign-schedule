'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { scheduleApi } from '@/services/scheduleApi'
import { computeWeekDates } from '@/utils/weekSchedule'

export function usePrefetchWeeks(currentDate: Date) {
   const queryClient = useQueryClient()

   useEffect(() => {
      const prevDate = new Date(currentDate)
      prevDate.setDate(prevDate.getDate() - 7)
      const prevWeek = computeWeekDates(prevDate)
      const prevParams = {
         startDate: prevWeek[0].dateObj.toISOString(),
         endDate: prevWeek[6].dateObj.toISOString(),
      }

      const nextDate = new Date(currentDate)
      nextDate.setDate(nextDate.getDate() + 7)
      const nextWeek = computeWeekDates(nextDate)
      const nextParams = {
         startDate: nextWeek[0].dateObj.toISOString(),
         endDate: nextWeek[6].dateObj.toISOString(),
      }

      queryClient.prefetchQuery({
         queryKey: queryKeys.schedule.list(prevParams),
         queryFn: () => scheduleApi.getSchedule(prevParams),
         staleTime: 1000 * 60 * 5,
      })

      queryClient.prefetchQuery({
         queryKey: queryKeys.schedule.list(nextParams),
         queryFn: () => scheduleApi.getSchedule(nextParams),
         staleTime: 1000 * 60 * 5,
      })
   }, [currentDate, queryClient])
}
