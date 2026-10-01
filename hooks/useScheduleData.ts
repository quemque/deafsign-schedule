'use client'

import { useState, useEffect, useMemo } from 'react'
import {
   useCurrentUserQuery,
   useScheduleLessonsQuery,
} from './useScheduleQueries'
import { usePrefetchWeeks } from './usePrefetchWeeks'
import { useScheduleStore } from '@/stores/useScheduleStore'
import {
   getWeekDates,
   formatWeekLabel,
   getWeekRangeParams,
} from '@/utils/scheduleTime'

export function useScheduleData() {
   const currentDate = useScheduleStore((state) => state.currentDate)
   const [currentTime, setCurrentTime] = useState(() => new Date())

   useEffect(() => {
      const timer = setInterval(() => setCurrentTime(new Date()), 60000)
      return () => clearInterval(timer)
   }, [])

   usePrefetchWeeks(currentDate)

   const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate])
   const queryParams = useMemo(
      () => getWeekRangeParams(currentDate),
      [currentDate],
   )

   const { data: user, isLoading: isUserLoading } = useCurrentUserQuery()
   const {
      data: visibleLessons = [],
      isLoading: isLessonsLoading,
      isFetching: isLessonsFetching,
      error: lessonsError,
      refetch,
   } = useScheduleLessonsQuery(queryParams)

   const currentWeekLabel = useMemo(
      () => formatWeekLabel(currentDate),
      [currentDate],
   )

   return {
      user,
      loading: isUserLoading || isLessonsLoading,
      isFetching: isLessonsFetching,
      error: lessonsError instanceof Error ? lessonsError.message : null,
      refetch,
      currentTime,
      weekDates,
      currentWeekLabel,
      visibleLessons,
   }
}
