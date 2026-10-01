'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { homeworkApi } from '@/services/homeworkApi'
import type {
   CreateHomeworkInput,
   UpdateHomeworkInput,
} from '@/schemas/homework.schema'

export function useHomeworkQuery(
   lessonId: string | null,
   date: string | null,
   enabled: boolean = true,
) {
   return useQuery({
      queryKey: ['homeworks', lessonId, date],
      queryFn: () => {
         if (!lessonId || !date) return { homeworks: [] }
         return homeworkApi.getHomeworks(lessonId, date)
      },
      enabled: Boolean(lessonId && date && enabled),
      staleTime: 1000 * 60 * 5,
   })
}

export function useHomeworkMutations(lessonId: string, date: string) {
   const queryClient = useQueryClient()

   const createMutation = useMutation({
      mutationFn: (payload: CreateHomeworkInput) =>
         homeworkApi.createHomework(lessonId, payload),
      onSuccess: () => {
         queryClient.invalidateQueries({
            queryKey: ['homeworks', lessonId, date],
         })
      },
   })

   const updateMutation = useMutation({
      mutationFn: (payload: UpdateHomeworkInput) =>
         homeworkApi.updateHomework(lessonId, payload),
      onSuccess: () => {
         queryClient.invalidateQueries({
            queryKey: ['homeworks', lessonId, date],
         })
      },
   })

   const deleteMutation = useMutation({
      mutationFn: (homeworkId: string) =>
         homeworkApi.deleteHomework(lessonId, homeworkId),
      onSuccess: () => {
         queryClient.invalidateQueries({
            queryKey: ['homeworks', lessonId, date],
         })
      },
   })

   return {
      createHomework: createMutation.mutateAsync,
      updateHomework: updateMutation.mutateAsync,
      deleteHomework: deleteMutation.mutateAsync,
      isCreating: createMutation.isPending,
      isUpdating: updateMutation.isPending,
      isDeleting: deleteMutation.isPending,
   }
}
