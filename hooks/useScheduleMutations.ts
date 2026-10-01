'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { scheduleApi } from '@/services/scheduleApi'
import { queryKeys } from '@/lib/queryKeys'
import type { DeleteLessonMode } from '@/types/schedule'
import type {
   CreateLessonInput,
   UpdateLessonInput,
   RescheduleLessonInput,
   SaveCommentInput,
} from '@/schemas/schedule.schema'

interface UpdateLessonVariables {
   id: string
   payload: UpdateLessonInput
}

interface RescheduleLessonVariables {
   id: string
   payload: RescheduleLessonInput
}

interface DeleteLessonVariables {
   id: string
   mode: DeleteLessonMode
   date?: Date | string
}

interface SaveCommentVariables {
   lessonId: string
   payload: SaveCommentInput
}

export function useScheduleMutations() {
   const queryClient = useQueryClient()

   const invalidateSchedule = () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.schedule.all })
   }

   const createLessonMutation = useMutation({
      mutationFn: (payload: CreateLessonInput) =>
         scheduleApi.createLesson(payload),
      onSuccess: invalidateSchedule,
   })

   const updateLessonMutation = useMutation({
      mutationFn: ({ id, payload }: UpdateLessonVariables) =>
         scheduleApi.updateLesson(id, payload),
      onSuccess: invalidateSchedule,
   })

   const rescheduleLessonMutation = useMutation({
      mutationFn: ({ id, payload }: RescheduleLessonVariables) =>
         scheduleApi.rescheduleLesson(id, payload),
      onSuccess: invalidateSchedule,
   })

   const deleteLessonMutation = useMutation({
      mutationFn: ({ id, mode, date }: DeleteLessonVariables) =>
         scheduleApi.deleteLesson(id, mode, date),
      onSuccess: invalidateSchedule,
   })

   const saveCommentMutation = useMutation({
      mutationFn: ({ lessonId, payload }: SaveCommentVariables) =>
         scheduleApi.saveComment(lessonId, payload),
      onSuccess: invalidateSchedule,
   })

   return {
      createLesson: createLessonMutation.mutateAsync,
      updateLesson: updateLessonMutation.mutateAsync,
      rescheduleLesson: rescheduleLessonMutation.mutateAsync,
      deleteLesson: deleteLessonMutation.mutateAsync,
      saveComment: (variables: {
         lessonId: string
         date: string
         text: string
      }) =>
         saveCommentMutation.mutateAsync({
            lessonId: variables.lessonId,
            payload: { date: variables.date, text: variables.text },
         }),
      isCreating: createLessonMutation.isPending,
      isUpdating: updateLessonMutation.isPending,
      isDeleting: deleteLessonMutation.isPending,
   }
}
