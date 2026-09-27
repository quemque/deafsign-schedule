'use client'

import { useQuery } from '@tanstack/react-query'
import { scheduleApi } from '@/services/scheduleApi'
import { queryKeys } from '@/lib/queryKeys'

export function useCurrentUserQuery() {
   return useQuery({
      queryKey: queryKeys.auth.me(),
      queryFn: async () => {
         const data = await scheduleApi.getMe()
         return data.user
      },
      staleTime: 1000 * 60 * 15,
   })
}

export function useScheduleLessonsQuery(range?: {
   startDate?: string
   endDate?: string
}) {
   return useQuery({
      queryKey: queryKeys.schedule.list(range),
      queryFn: async () => {
         const data = await scheduleApi.getSchedule(range)
         return data.lessons
      },
   })
}
