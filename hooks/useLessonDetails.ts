import { useState } from 'react'
import type { ApiLesson } from '@/types/schedule'
import { scheduleApi } from '@/services/scheduleApi'

export function useLessonDetails(onUpdate?: () => void) {
   const [activeLesson, setActiveLesson] = useState<ApiLesson | null>(null)
   const [commentText, setCommentText] = useState('')

   const openDetails = (lesson: ApiLesson) => {
      setActiveLesson(lesson)
      setCommentText(lesson.comment || '')
   }

   const closeDetails = () => {
      setActiveLesson(null)
      setCommentText('')
   }

   const saveComment = async () => {
      if (!activeLesson) return
      try {
         await scheduleApi.updateLesson(activeLesson.id, {
            comment: commentText,
         })
         setActiveLesson((prev) =>
            prev ? { ...prev, comment: commentText } : null,
         )
         onUpdate?.()
      } catch (err) {
         console.error(err)
      }
   }

   const deleteActiveLesson = async (id: string) => {
      if (!confirm('Удалить занятие?')) return
      try {
         await scheduleApi.deleteLesson(id)
         closeDetails()
         onUpdate?.()
      } catch (err) {
         console.error(err)
      }
   }

   return {
      activeLesson,
      commentText,
      setCommentText,
      openDetails,
      closeDetails,
      saveComment,
      deleteActiveLesson,
   }
}
