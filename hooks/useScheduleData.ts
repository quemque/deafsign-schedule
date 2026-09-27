'use client'

import { useMemo, useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useScheduleStore } from '@/stores/useScheduleStore'
import {
   useCurrentUserQuery,
   useScheduleLessonsQuery,
} from '@/hooks/useScheduleQueries'
import { computeWeekDates, formatWeekLabel } from '@/utils/weekSchedule'
import { queryKeys } from '@/lib/queryKeys'

export function useScheduleData() {
   const queryClient = useQueryClient()
   const [currentTime, setCurrentTime] = useState(() => new Date())

   const currentDate = useScheduleStore((state) => state.currentDate)
   const setCurrentDate = useScheduleStore((state) => state.setCurrentDate)
   const prevWeek = useScheduleStore((state) => state.prevWeek)
   const nextWeek = useScheduleStore((state) => state.nextWeek)
   const prevDay = useScheduleStore((state) => state.prevDay)
   const nextDay = useScheduleStore((state) => state.nextDay)
   const setToday = useScheduleStore((state) => state.setToday)

   useEffect(() => {
      const interval = setInterval(() => setCurrentTime(new Date()), 60000)
      return () => clearInterval(interval)
   }, [])

   const weekDates = useMemo(() => computeWeekDates(currentDate), [currentDate])

   const currentWeekLabel = useMemo(
      () => formatWeekLabel(weekDates),
      [weekDates],
   )

   const dateRange = useMemo(() => {
      if (weekDates.length === 0) return undefined
      const startDate = weekDates[0].dateObj.toISOString()
      const endDate = weekDates[weekDates.length - 1].dateObj.toISOString()
      return { startDate, endDate }
   }, [weekDates])

   const { data: user, isLoading: isUserLoading } = useCurrentUserQuery()
   const { data: lessons = [], isLoading: isLessonsLoading } =
      useScheduleLessonsQuery(dateRange)

   const refreshSchedule = () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.schedule.all })
   }

   return {
      user: user ?? null,
      loading: isUserLoading || isLessonsLoading,
      currentDate,
      setCurrentDate,
      currentTime,
      weekDates,
      currentWeekLabel,
      visibleLessons: lessons,
      prevWeek,
      nextWeek,
      prevDay,
      nextDay,
      setToday,
      refreshSchedule,
   }
}
