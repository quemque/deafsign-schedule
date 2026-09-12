import { useState, useEffect, useMemo } from 'react'
import type { ApiLesson, CurrentUser } from '@/types/schedule'
import { DAYS_OF_WEEK } from '@/constants/schedule'
import {
   getStartOfWeek,
   getWeekLabel,
   filterLessonsForWeek,
} from '@/utils/date'
import { scheduleApi } from '@/services/scheduleApi'

export function useScheduleData() {
   const [lessons, setLessons] = useState<ApiLesson[]>([])
   const [user, setUser] = useState<CurrentUser | null>(null)
   const [loading, setLoading] = useState(true)
   const [currentDate, setCurrentDate] = useState(new Date())
   const [currentTime, setCurrentTime] = useState(new Date())

   const fetchAll = async () => {
      try {
         const [scheduleData, meData] = await Promise.all([
            scheduleApi.getSchedule(),
            scheduleApi.getMe(),
         ])
         if (scheduleData?.lessons) setLessons(scheduleData.lessons)
         if (meData?.user) setUser(meData.user)
      } catch (err) {
         console.error(err)
      } finally {
         setLoading(false)
      }
   }

   useEffect(() => {
      fetchAll()
      const timer = setInterval(() => setCurrentTime(new Date()), 60000)
      return () => clearInterval(timer)
   }, [])

   const weekDates = useMemo(() => {
      const start = getStartOfWeek(currentDate)
      return DAYS_OF_WEEK.map((d, i) => {
         const date = new Date(start)
         date.setDate(start.getDate() + i)
         return {
            ...d,
            dateObj: date,
            dateNumber: date.getDate(),
            isToday: date.toDateString() === new Date().toDateString(),
         }
      })
   }, [currentDate])

   const currentWeekLabel = useMemo(
      () => getWeekLabel(weekDates[0].dateObj, weekDates[6].dateObj),
      [weekDates],
   )

   const visibleLessons = useMemo(
      () =>
         filterLessonsForWeek(
            lessons,
            weekDates[0].dateObj,
            weekDates[6].dateObj,
         ),
      [lessons, weekDates],
   )

   const prevWeek = () => {
      const d = new Date(currentDate)
      d.setDate(d.getDate() - 7)
      setCurrentDate(d)
   }

   const nextWeek = () => {
      const d = new Date(currentDate)
      d.setDate(d.getDate() + 7)
      setCurrentDate(d)
   }

   const setToday = () => setCurrentDate(new Date())

   return {
      user,
      loading,
      currentDate,
      setCurrentDate,
      currentTime,
      weekDates,
      currentWeekLabel,
      visibleLessons,
      prevWeek,
      nextWeek,
      setToday,
      refreshSchedule: fetchAll,
   }
}
