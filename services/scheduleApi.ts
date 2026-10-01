import type { ApiLesson, DeleteLessonMode } from '@/types/schedule'
import type {
   CreateLessonInput,
   UpdateLessonInput,
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
   startDateOrParams?: string | { startDate?: string; endDate?: string },
   endDateArg?: string,
): Promise<{ lessons: ApiLesson[] }> {
   let start: string | undefined
   let end: string | undefined

   if (typeof startDateOrParams === 'object' && startDateOrParams !== null) {
      start = startDateOrParams.startDate
      end = startDateOrParams.endDate
   } else {
      start = startDateOrParams
      end = endDateArg
   }

   const params = new URLSearchParams()
   if (start) params.set('startDate', start)
   if (end) params.set('endDate', end)
   const query = params.toString() ? `?${params.toString()}` : ''

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
      payload: {
         originalDate: string
         newDate: string
         newStartTime: string
         newEndTime: string
      },
   ): Promise<{ success: boolean }> {
      return request<{ success: boolean }>(`/api/schedule/${id}/reschedule`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(payload),
      })
   },

   async saveComment(
      lessonId: string,
      date: string,
      text: string,
   ): Promise<{ success: boolean }> {
      return request<{ success: boolean }>(
         `/api/schedule/${lessonId}/comment`,
         {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date, text }),
         },
      )
   },

   async deleteLesson(
      idOrParams:
         | string
         | { id: string; mode: DeleteLessonMode; date?: Date | string },
      modeArg?: DeleteLessonMode,
      dateArg?: Date | string,
   ): Promise<{ success: boolean }> {
      let id: string
      let mode: DeleteLessonMode = 'all'
      let date: Date | string | undefined

      if (typeof idOrParams === 'object') {
         id = idOrParams.id
         mode = idOrParams.mode || 'all'
         date = idOrParams.date
      } else {
         id = idOrParams
         mode = modeArg || 'all'
         date = dateArg
      }

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
