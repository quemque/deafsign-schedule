import type { ApiLesson, DeleteLessonMode } from '@/types/schedule'
import type {
   CreateLessonInput,
   UpdateLessonInput,
   RescheduleLessonInput,
   SaveCommentInput,
   ScheduleListQueryParams,
} from '@/schemas/schedule.schema'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
   const res = await fetch(url, options)
   const data = await res.json().catch(() => null)
   if (!res.ok) {
      throw new Error(data?.error || `Ошибка сервера: ${res.status}`)
   }
   return data
}

function formatDateKey(date?: Date | string | null): string | undefined {
   if (!date) return undefined
   if (typeof date === 'string') {
      return date.includes('T') ? date.split('T')[0] : date
   }
   const y = date.getFullYear()
   const m = String(date.getMonth() + 1).padStart(2, '0')
   const d = String(date.getDate()).padStart(2, '0')
   return `${y}-${m}-${d}`
}

async function getLessons(
   paramsOrStart?: ScheduleListQueryParams | string,
   endDateArg?: string,
): Promise<{ lessons: ApiLesson[] }> {
   let startDate: string | undefined
   let endDate: string | undefined

   if (typeof paramsOrStart === 'object' && paramsOrStart !== null) {
      startDate = paramsOrStart.startDate
      endDate = paramsOrStart.endDate
   } else {
      startDate = paramsOrStart
      endDate = endDateArg
   }

   const searchParams = new URLSearchParams()
   if (startDate) searchParams.set('startDate', startDate)
   if (endDate) searchParams.set('endDate', endDate)
   const query = searchParams.toString() ? `?${searchParams.toString()}` : ''
   return request<{ lessons: ApiLesson[] }>(`/api/schedule${query}`)
}

export const scheduleApi = {
   getLessons,
   getSchedule: getLessons,

   async createLesson(
      payload: CreateLessonInput,
   ): Promise<{ lesson: ApiLesson }> {
      return request<{ lesson: ApiLesson }>('/api/schedule', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(payload),
      })
   },

   async updateLesson(
      id: string,
      payload: UpdateLessonInput,
   ): Promise<{ lesson: ApiLesson }> {
      return request<{ lesson: ApiLesson }>(`/api/schedule/${id}`, {
         method: 'PUT',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(payload),
      })
   },

   async rescheduleLesson(
      id: string,
      payload: RescheduleLessonInput,
   ): Promise<{ success: boolean }> {
      return request<{ success: boolean }>(`/api/schedule/${id}/reschedule`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(payload),
      })
   },

   async saveComment(
      lessonId: string,
      payload: SaveCommentInput,
   ): Promise<{ success: boolean }> {
      return request<{ success: boolean }>(
         `/api/schedule/${lessonId}/comment`,
         {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
         },
      )
   },

   async deleteLesson(
      id: string,
      mode: DeleteLessonMode = 'all',
      date?: Date | string,
   ): Promise<{ success: boolean }> {
      const params = new URLSearchParams({ mode })
      const formattedDate = formatDateKey(date)
      if (formattedDate && mode !== 'all') {
         params.set('date', formattedDate)
      }

      return request<{ success: boolean }>(
         `/api/schedule/${id}?${params.toString()}`,
         {
            method: 'DELETE',
         },
      )
   },
}
