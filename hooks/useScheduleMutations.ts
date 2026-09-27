'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { scheduleApi } from '@/services/scheduleApi'
import { queryKeys } from '@/lib/queryKeys'
import type { DeleteLessonMode } from '@/types/schedule'

interface RescheduleVariables {
   id: string
   payload: {
      originalDate: string
      newDate: string
      newStartTime: string
      newEndTime: string
   }
}

interface UpdateLessonVariables {
   id: string
   payload: unknown
}

interface DeleteLessonVariables {
   id: string
   mode: DeleteLessonMode
   date?: Date
}

interface SaveCommentVariables {
   lessonId: string
   date: string
   text: string
}

export function useScheduleMutations() {
   const queryClient = useQueryClient()

   const invalidateSchedule = () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.schedule.all })
   }

   const createLessonMutation = useMutation({
      mutationFn: (payload: unknown) => scheduleApi.createLesson(payload),
      onSuccess: invalidateSchedule,
   })

   const updateLessonMutation = useMutation({
      mutationFn: ({ id, payload }: UpdateLessonVariables) =>
         scheduleApi.updateLesson(id, payload),
      onSuccess: invalidateSchedule,
   })

   const rescheduleLessonMutation = useMutation({
      mutationFn: ({ id, payload }: RescheduleVariables) =>
         scheduleApi.rescheduleLesson(id, payload),
      onSuccess: invalidateSchedule,
   })

   const deleteLessonMutation = useMutation({
      mutationFn: ({ id, mode, date }: DeleteLessonVariables) =>
         scheduleApi.deleteLesson(id, mode, date),
      onSuccess: invalidateSchedule,
   })

   const saveCommentMutation = useMutation({
      mutationFn: ({ lessonId, date, text }: SaveCommentVariables) =>
         scheduleApi.saveComment(lessonId, date, text),
      onSuccess: invalidateSchedule,
   })

   return {
      createLesson: createLessonMutation.mutateAsync,
      updateLesson: updateLessonMutation.mutateAsync,
      rescheduleLesson: rescheduleLessonMutation.mutateAsync,
      deleteLesson: deleteLessonMutation.mutateAsync,
      saveComment: saveCommentMutation.mutateAsync,
      isCreating: createLessonMutation.isPending,
      isUpdating: updateLessonMutation.isPending,
      isDeleting: deleteLessonMutation.isPending,
   }
}
