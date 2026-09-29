import type { SaveHomeworkInput } from '@/schemas/homework.schema'
import type { Homework } from '@/types/schedule'

export interface HomeworkResponse {
   homework: Homework | null
}

export const homeworkApi = {
   async getHomework(
      lessonId: string,
      date: string,
   ): Promise<HomeworkResponse> {
      const res = await fetch(`/api/schedule/${lessonId}/homework?date=${date}`)
      if (!res.ok) throw new Error('Ошибка получения домашнего задания')
      return res.json()
   },

   async saveHomework(
      lessonId: string,
      payload: SaveHomeworkInput,
   ): Promise<HomeworkResponse> {
      const res = await fetch(`/api/schedule/${lessonId}/homework`, {
         method: 'PUT',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Ошибка сохранения домашнего задания')
      return res.json()
   },

   async deleteHomework(lessonId: string, date: string): Promise<void> {
      const res = await fetch(
         `/api/schedule/${lessonId}/homework?date=${date}`,
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
