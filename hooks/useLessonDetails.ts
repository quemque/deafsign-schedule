import { useState } from 'react'
import type { ApiLesson, DeleteLessonMode } from '@/types/schedule'
import { scheduleApi } from '@/services/scheduleApi'

export function useLessonDetails(onUpdate?: () => void) {
   const [activeLesson, setActiveLesson] = useState<ApiLesson | null>(null)
   const [selectedDate, setSelectedDate] = useState<Date>(new Date())
   const [commentText, setCommentText] = useState('')

   const openDetails = (lesson: ApiLesson, dayDate: Date) => {
      setActiveLesson(lesson)
      setSelectedDate(dayDate)

      const dateStr = dayDate.toISOString().split('T')[0]
      const currentComment =
         lesson.comments?.find((c: any) => c.date?.startsWith(dateStr))?.text ||
         ''
      setCommentText(currentComment)
   }

   const closeDetails = () => {
      setActiveLesson(null)
      setCommentText('')
   }

   const saveComment = async () => {
      if (!activeLesson) return

      try {
         const yyyy = selectedDate.getFullYear()
         const mm = String(selectedDate.getMonth() + 1).padStart(2, '0')
         const dd = String(selectedDate.getDate()).padStart(2, '0')
         const targetDate = `${yyyy}-${mm}-${dd}`

         const res = await fetch(`/api/schedule/${activeLesson.id}/comment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               text: commentText,
               date: targetDate,
            }),
         })

         if (res.ok) {
            onUpdate?.()
            closeDetails()
         }
      } catch (err) {
         console.error('Ошибка сохранения комментария:', err)
      }
   }

   const deleteActiveLesson = async (mode: DeleteLessonMode = 'all') => {
      if (!activeLesson) return
      try {
         await scheduleApi.deleteLesson(activeLesson.id, mode, selectedDate)
         closeDetails()
         onUpdate?.()
      } catch (err) {
         console.error('Ошибка удаления занятия:', err)
      }
   }

   return {
      activeLesson,
      selectedDate,
      commentText,
      setCommentText,
      openDetails,
      closeDetails,
      saveComment,
      deleteActiveLesson,
   }
}
