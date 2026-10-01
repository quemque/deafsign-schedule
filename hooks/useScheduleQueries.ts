import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { scheduleApi } from '@/services/scheduleApi'
import type { CurrentUser } from '@/types/schedule'
import type { ScheduleListQueryParams } from '@/schemas/schedule.schema'

export function useCurrentUserQuery() {
   return useQuery<CurrentUser | null>({
      queryKey: ['auth', 'user'],
      queryFn: async () => {
         const res = await fetch('/api/auth/me')
         if (!res.ok) return null
         const data = await res.json()
         return data.user ?? null
      },
      staleTime: 1000 * 60 * 15,
   })
}

export function useScheduleLessonsQuery(params?: ScheduleListQueryParams) {
   return useQuery({
      queryKey: queryKeys.schedule.list(params),
      queryFn: () => scheduleApi.getLessons(params),
      select: (data) => data?.lessons ?? [],
      staleTime: 1000 * 60 * 5,
   })
}
