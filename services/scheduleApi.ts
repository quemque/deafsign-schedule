import type { ApiLesson, Teacher, CurrentUser } from '@/types/schedule'

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

   deleteLesson: (id: string) =>
      request<void>(`/api/schedule/${id}`, { method: 'DELETE' }),
}
