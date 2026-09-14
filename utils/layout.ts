import type { ApiLesson } from '@/types/schedule'

const INDEX_TO_DAY = [
   'SUNDAY',
   'MONDAY',
   'TUESDAY',
   'WEDNESDAY',
   'THURSDAY',
   'FRIDAY',
   'SATURDAY',
]

export interface LayoutLesson {
   lesson: ApiLesson
   startsAt: Date
   endsAt: Date
   startMinutes: number
   endMinutes: number
   column: number
   totalColumns: number
}

function getLessonTimes(lesson: ApiLesson, dayDate: Date) {
   const yyyy = dayDate.getFullYear()
   const mm = String(dayDate.getMonth() + 1).padStart(2, '0')
   const dd = String(dayDate.getDate()).padStart(2, '0')
   const dateKey = `${yyyy}-${mm}-${dd}`
   const dayKey = INDEX_TO_DAY[dayDate.getDay()]

   const rescheduleSlot = lesson.reschedules?.find((r) => {
      const rDateStr =
         typeof r.newStartsAt === 'string'
            ? r.newStartsAt.split('T')[0]
            : new Date(r.newStartsAt).toISOString().split('T')[0]
      return rDateStr === dateKey
   })

   if (rescheduleSlot) {
      return {
         startsAt: new Date(rescheduleSlot.newStartsAt),
         endsAt: new Date(rescheduleSlot.newEndsAt),
      }
   }

   const customDayTime = lesson.timeByDay?.[dayKey]
   if (
      lesson.isRecurring &&
      customDayTime?.startTime &&
      customDayTime?.endTime
   ) {
      const [sh, sm] = customDayTime.startTime.split(':').map(Number)
      const [eh, em] = customDayTime.endTime.split(':').map(Number)
      return {
         startsAt: new Date(
            Date.UTC(yyyy, dayDate.getMonth(), dayDate.getDate(), sh, sm, 0),
         ),
         endsAt: new Date(
            Date.UTC(yyyy, dayDate.getMonth(), dayDate.getDate(), eh, em, 0),
         ),
      }
   }

   return {
      startsAt: new Date(lesson.startsAt),
      endsAt: new Date(lesson.endsAt),
   }
}

export function computeDayLayout(
   lessons: ApiLesson[],
   dayDate: Date,
): LayoutLesson[] {
   if (lessons.length === 0) return []

   const items = lessons.map((lesson) => {
      const { startsAt, endsAt } = getLessonTimes(lesson, dayDate)
      const startMinutes =
         startsAt.getUTCHours() * 60 + startsAt.getUTCMinutes()
      const endMinutes = Math.max(
         endsAt.getUTCHours() * 60 + endsAt.getUTCMinutes(),
         startMinutes + 30,
      )
      return {
         lesson,
         startsAt,
         endsAt,
         startMinutes,
         endMinutes,
         column: 0,
         totalColumns: 1,
      }
   })

   items.sort((a, b) => {
      if (a.startMinutes !== b.startMinutes) {
         return a.startMinutes - b.startMinutes
      }
      return b.endMinutes - a.endMinutes
   })

   const clusters: (typeof items)[] = []
   let currentCluster: typeof items = []
   let clusterEnd = -1

   items.forEach((item) => {
      if (currentCluster.length === 0) {
         currentCluster.push(item)
         clusterEnd = item.endMinutes
      } else if (item.startMinutes < clusterEnd) {
         currentCluster.push(item)
         clusterEnd = Math.max(clusterEnd, item.endMinutes)
      } else {
         clusters.push(currentCluster)
         currentCluster = [item]
         clusterEnd = item.endMinutes
      }
   })

   if (currentCluster.length > 0) {
      clusters.push(currentCluster)
   }

   clusters.forEach((cluster) => {
      const columns: number[] = []

      cluster.forEach((item) => {
         let placedCol = -1
         for (let i = 0; i < columns.length; i++) {
            if (columns[i] <= item.startMinutes) {
               placedCol = i
               columns[i] = item.endMinutes
               break
            }
         }

         if (placedCol === -1) {
            placedCol = columns.length
            columns.push(item.endMinutes)
         }

         item.column = placedCol
      })

      const totalCols = columns.length
      cluster.forEach((item) => {
         item.totalColumns = totalCols
      })
   })

   return items
}
