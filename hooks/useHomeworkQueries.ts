'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { homeworkApi } from '@/services/homeworkApi'
import type { SaveHomeworkInput } from '@/schemas/homework.schema'

export function useHomeworkQuery(
   lessonId: string | null,
   date: string | null,
   enabled: boolean = true,
) {
   return useQuery({
      queryKey: ['homework', lessonId, date],
      queryFn: () => {
         if (!lessonId || !date) return { homework: null }
         return homeworkApi.getHomework(lessonId, date)
      },
      enabled: Boolean(lessonId && date && enabled),
      staleTime: 1000 * 60 * 5,
   })
}

export function useHomeworkMutations(lessonId: string, date: string) {
   const queryClient = useQueryClient()

   const saveMutation = useMutation({
      mutationFn: (payload: SaveHomeworkInput) =>
         homeworkApi.saveHomework(lessonId, payload),
      onSuccess: () => {
         queryClient.invalidateQueries({
            queryKey: ['homework', lessonId, date],
         })
      },
   })

   const deleteMutation = useMutation({
      mutationFn: () => homeworkApi.deleteHomework(lessonId, date),
      onSuccess: () => {
         queryClient.invalidateQueries({
            queryKey: ['homework', lessonId, date],
         })
      },
   })

   return {
      saveHomework: saveMutation.mutateAsync,
      deleteHomework: deleteMutation.mutateAsync,
      isSaving: saveMutation.isPending,
      isDeleting: deleteMutation.isPending,
   }
}
