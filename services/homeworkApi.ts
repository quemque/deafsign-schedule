import type {
   CreateHomeworkInput,
   UpdateHomeworkInput,
} from '@/schemas/homework.schema'
import type { Homework } from '@/types/schedule'

export interface HomeworkListResponse {
   homeworks: (Homework & { isLocked?: boolean })[]
}

export interface HomeworkSingleResponse {
   homework: Homework
}

export const homeworkApi = {
   async getHomeworks(
      lessonId: string,
      date: string,
   ): Promise<HomeworkListResponse> {
      const res = await fetch(`/api/schedule/${lessonId}/homework?date=${date}`)
      if (!res.ok) throw new Error('Ошибка получения домашних заданий')
      return res.json()
   },

   async createHomework(
      lessonId: string,
      payload: CreateHomeworkInput,
   ): Promise<HomeworkSingleResponse> {
      const res = await fetch(`/api/schedule/${lessonId}/homework`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Ошибка создания домашнего задания')
      return res.json()
   },

   async updateHomework(
      lessonId: string,
      payload: UpdateHomeworkInput,
   ): Promise<HomeworkSingleResponse> {
      const res = await fetch(`/api/schedule/${lessonId}/homework`, {
         method: 'PUT',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Ошибка обновления домашнего задания')
      return res.json()
   },

   async deleteHomework(lessonId: string, homeworkId: string): Promise<void> {
      const res = await fetch(
         `/api/schedule/${lessonId}/homework?homeworkId=${homeworkId}`,
         {
            method: 'DELETE',
         },
      )
      if (!res.ok) throw new Error('Ошибка удаления домашнего задания')
   },

   async getPresignedUploadUrl(
      file: File,
   ): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
      const res = await fetch('/api/upload/presigned', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
         }),
      })
      if (!res.ok) throw new Error('Ошибка получения ссылки хранилища')
      return res.json()
   },

   uploadFileWithProgress(
      uploadUrl: string,
      file: File,
      onProgress: (percent: number) => void,
   ): Promise<void> {
      return new Promise((resolve, reject) => {
         const xhr = new XMLHttpRequest()
         xhr.open('PUT', uploadUrl)
         xhr.setRequestHeader('Content-Type', file.type)

         xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
               const percent = Math.round((event.loaded / event.total) * 100)
               onProgress(percent)
            }
         }

         xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
               resolve()
            } else {
               reject(new Error('Сбой загрузки файла'))
            }
         }

         xhr.onerror = () => reject(new Error('Сетевой сбой'))
         xhr.send(file)
      })
   },
}
