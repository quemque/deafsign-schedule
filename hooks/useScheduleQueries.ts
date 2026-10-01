import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { scheduleApi } from '@/services/scheduleApi'

export function useCurrentUserQuery() {
   return useQuery({
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

export function useScheduleQuery(params?: {
   startDate?: string
   endDate?: string
}) {
   return useQuery({
      queryKey: queryKeys.schedule.list(params),
      queryFn: () => scheduleApi.getLessons(params?.startDate, params?.endDate),
      placeholderData: keepPreviousData,
      staleTime: 1000 * 60 * 5,
   })
}

export function useScheduleLessonsQuery(params?: {
   startDate?: string
   endDate?: string
}) {
   return useQuery({
      queryKey: queryKeys.schedule.list(params),
      queryFn: () => scheduleApi.getLessons(params?.startDate, params?.endDate),
      select: (data) => data?.lessons ?? [],
      placeholderData: keepPreviousData,
      staleTime: 1000 * 60 * 5,
   })
}
