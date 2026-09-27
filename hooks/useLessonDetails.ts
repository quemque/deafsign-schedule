'use client'

import { useState } from 'react'
import type { ApiLesson, DeleteLessonMode } from '@/types/schedule'
import { useScheduleMutations } from '@/hooks/useScheduleMutations'

export function useLessonDetails(onSuccess?: () => void) {
   const [activeLesson, setActiveLesson] = useState<ApiLesson | null>(null)
   const [selectedDate, setSelectedDate] = useState<Date>(new Date())
   const [commentText, setCommentText] = useState('')

   const { saveComment: mutateComment, deleteLesson: mutateDelete } =
      useScheduleMutations()

   const openDetails = (lesson: ApiLesson, dayDate: Date) => {
      setActiveLesson(lesson)
      setSelectedDate(dayDate)

      const dateStr = dayDate.toISOString().split('T')[0]
      const currentComment =
         lesson.comments?.find((c) => {
            const commentDate =
               typeof c.date === 'string'
                  ? c.date
                  : new Date(c.date).toISOString()
            return commentDate.startsWith(dateStr)
         })?.text || ''

      setCommentText(currentComment)
   }

   const closeDetails = () => {
      setActiveLesson(null)
      setCommentText('')
   }

   const saveComment = async () => {
      if (!activeLesson) return

      const yyyy = selectedDate.getFullYear()
      const mm = String(selectedDate.getMonth() + 1).padStart(2, '0')
      const dd = String(selectedDate.getDate()).padStart(2, '0')
      const targetDate = `${yyyy}-${mm}-${dd}`

      try {
         await mutateComment({
            lessonId: activeLesson.id,
            date: targetDate,
            text: commentText,
         })
         onSuccess?.()
         closeDetails()
      } catch (err) {
         console.error(err)
      }
   }

   const deleteActiveLesson = async (mode: DeleteLessonMode = 'all') => {
      if (!activeLesson) return

      try {
         await mutateDelete({
            id: activeLesson.id,
            mode,
            date: selectedDate,
         })
         closeDetails()
         onSuccess?.()
      } catch (err) {
         console.error(err)
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
