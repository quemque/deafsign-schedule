'use client'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import {
   useHomeworkQuery,
   useHomeworkMutations,
} from '@/hooks/useHomeworkQueries'
import { HomeworkEmptyState } from './HomeworkEmptyState'
import { HomeworkLockedCard } from './HomeworkLockedCard'
import { HomeworkCard } from './HomeworkCard'
import { HomeworkForm } from './HomeworkForm'
import type { Homework, HomeworkVideoItem } from '@/types/schedule'

interface HomeworkTabProps {
   lessonId: string
   date: string
   canEdit: boolean
   onHasHomeworkChange?: (hasHomework: boolean) => void
}

export function HomeworkTab({
   lessonId,
   date,
   canEdit,
   onHasHomeworkChange,
}: HomeworkTabProps) {
   const { data, isLoading } = useHomeworkQuery(lessonId, date)
   const {
      createHomework,
      updateHomework,
      deleteHomework,
      isCreating,
      isUpdating,
   } = useHomeworkMutations(lessonId, date)

   const [editingItem, setEditingItem] = useState<Homework | null>(null)
   const [isCreatingNew, setIsCreatingNew] = useState(false)

   const homeworks = data?.homeworks || []
   const isFormOpen = isCreatingNew || editingItem !== null

   useEffect(() => {
      if (!isLoading) {
         onHasHomeworkChange?.(homeworks.length > 0)
      }
   }, [homeworks.length, isLoading, onHasHomeworkChange])

   const handleFormSubmit = async ({
      title,
      description,
      videos,
      unlockDate,
   }: {
      title: string
      description: string
      videos: HomeworkVideoItem[]
      unlockDate: string | null
   }) => {
      const sanitizedVideos = videos.map((v) => ({
         ...v,
         url: v.url?.trim() || '',
      }))

      const firstVideoUrl = sanitizedVideos[0]?.url || null
      const firstVideoKey = sanitizedVideos[0]?.key || null

      if (editingItem) {
         await updateHomework({
            id: editingItem.id,
            title: title || null,
            description,
            videos: sanitizedVideos,
            videoUrl: firstVideoUrl,
            videoKey: firstVideoKey,
            unlockDate,
         })
      } else {
         await createHomework({
            date,
            title: title || null,
            description,
            videos: sanitizedVideos,
            videoUrl: firstVideoUrl,
            videoKey: firstVideoKey,
            unlockDate,
         })
      }
      setIsCreatingNew(false)
      setEditingItem(null)
   }

   if (isLoading) {
      return (
         <div className="py-12 flex flex-col items-center justify-center text-xs text-[#8B857D] gap-2">
            <div className="w-5 h-5 border-2 border-[#8BA888] border-t-transparent rounded-full animate-spin" />
            <span>Загрузка домашних заданий...</span>
         </div>
      )
   }

   return (
      <div className="flex flex-col gap-4 py-1">
         <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#3E3A35]">
               Задания к занятию ({homeworks.length})
            </span>

            {canEdit && !isFormOpen && homeworks.length > 0 && (
               <button
                  type="button"
                  onClick={() => setIsCreatingNew(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#8BA888] text-white hover:bg-[#7A9A77] transition-colors shadow-2xs"
               >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Добавить задание</span>
               </button>
            )}
         </div>

         {isFormOpen && (
            <HomeworkForm
               editingItem={editingItem}
               isSaving={isCreating || isUpdating}
               onCancel={() => {
                  setIsCreatingNew(false)
                  setEditingItem(null)
               }}
               onSubmit={handleFormSubmit}
            />
         )}

         {homeworks.length === 0 && !isFormOpen && (
            <HomeworkEmptyState
               canEdit={canEdit}
               onStartCreate={() => setIsCreatingNew(true)}
            />
         )}

         <div className="flex flex-col gap-3">
            {homeworks.map((item, index) =>
               item.isLocked ? (
                  <HomeworkLockedCard key={item.id} item={item} index={index} />
               ) : (
                  <HomeworkCard
                     key={item.id}
                     item={item}
                     index={index}
                     canEdit={canEdit}
                     onEdit={(selected) => setEditingItem(selected)}
                     onDelete={(id) => {
                        if (confirm('Удалить это задание?')) {
                           deleteHomework(id)
                        }
                     }}
                  />
               ),
            )}
         </div>
      </div>
   )
}
