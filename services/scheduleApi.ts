import type {
   ApiLesson,
   Teacher,
   CurrentUser,
   DeleteLessonMode,
} from '@/types/schedule'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
   const res = await fetch(url, options)
   const data = await res.json().catch(() => null)
   if (!res.ok) {
      throw new Error(data?.error || `Ошибка сервера: ${res.status}`)
   }
   return data
}

export const scheduleApi = {
   getSchedule: () => request<{ lessons: ApiLesson[] }>('/api/schedule'),
   getMe: () => request<{ user: CurrentUser }>('/api/auth/me'),
   getTeachers: () => request<{ users: Teacher[] }>('/api/admin/users'),

   createLesson: (payload: any) =>
      request<{ lesson: ApiLesson }>('/api/schedule', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(payload),
      }),

   updateLesson: (id: string, payload: any) =>
      request<{ lesson: ApiLesson }>(`/api/schedule/${id}`, {
         method: 'PATCH',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(payload),
      }),

   deleteLesson: (id: string, mode: DeleteLessonMode = 'all', date?: Date) => {
      const params = new URLSearchParams({ mode })
      if (date) {
         const yyyy = date.getFullYear()
         const mm = String(date.getMonth() + 1).padStart(2, '0')
         const dd = String(date.getDate()).padStart(2, '0')
         params.set('date', `${yyyy}-${mm}-${dd}`)
      }
      return request<{ ok: boolean }>(
         `/api/schedule/${id}?${params.toString()}`,
         {
            method: 'DELETE',
         },
      )
   },
}
