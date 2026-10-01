'use client'

import { useState } from 'react'
import {
   useHomeworkQuery,
   useHomeworkMutations,
} from '@/hooks/useHomeworkQueries'
import { homeworkApi } from '@/services/homeworkApi'
import { SignVideoPlayer } from '@/components/schedule/SignVideoPlayer'
import type { Homework, HomeworkVideoItem } from '@/types/schedule'
import {
   UploadCloud,
   Trash2,
   Edit3,
   Check,
   BookOpen,
   Video,
   Plus,
   Lock,
   Calendar,
   X,
   Film,
} from 'lucide-react'

interface HomeworkTabProps {
   lessonId: string
   date: string
   canEdit: boolean
}

type HomeworkItem = Homework & { isLocked?: boolean }

export function HomeworkTab({ lessonId, date, canEdit }: HomeworkTabProps) {
   const { data, isLoading } = useHomeworkQuery(lessonId, date)
   const {
      createHomework,
      updateHomework,
      deleteHomework,
      isCreating,
      isUpdating,
   } = useHomeworkMutations(lessonId, date)

   const [editingItem, setEditingItem] = useState<HomeworkItem | null>(null)
   const [isCreatingNew, setIsCreatingNew] = useState(false)

   const [title, setTitle] = useState('')
   const [description, setDescription] = useState('')
   const [videos, setVideos] = useState<HomeworkVideoItem[]>([])
   const [unlockDate, setUnlockDate] = useState('')

   const [uploadProgressText, setUploadProgressText] = useState<string | null>(
      null,
   )
   const [isUploading, setIsUploading] = useState(false)
   const [errorMessage, setErrorMessage] = useState<string | null>(null)

   const [selectedVideoIndices, setSelectedVideoIndices] = useState<
      Record<string, number>
   >({})

   const homeworks = data?.homeworks || []

   const startCreate = () => {
      setEditingItem(null)
      setTitle('')
      setDescription('')
      setVideos([])
      setUnlockDate('')
      setErrorMessage(null)
      setIsCreatingNew(true)
   }

   const startEdit = (item: HomeworkItem) => {
      setIsCreatingNew(false)
      setEditingItem(item)
      setTitle(item.title || '')
      setDescription(item.description || '')

      const itemVideos: HomeworkVideoItem[] =
         item.videos && item.videos.length > 0
            ? item.videos
            : item.videoUrl
              ? [
                   {
                      id: '1',
                      url: item.videoUrl,
                      key: item.videoKey || '',
                      title: 'Видео 1',
                   },
                ]
              : []

      setVideos(itemVideos)
      setUnlockDate(
         item.unlockDate
            ? new Date(item.unlockDate).toISOString().slice(0, 16)
            : '',
      )
      setErrorMessage(null)
   }

   const resetForm = () => {
      setIsCreatingNew(false)
      setEditingItem(null)
      setUploadProgressText(null)
      setIsUploading(false)
      setErrorMessage(null)
      setVideos([])
   }

   const handleMultipleFilesUpload = async (
      e: React.ChangeEvent<HTMLInputElement>,
   ) => {
      const files = e.target.files
      if (!files || files.length === 0) return

      setErrorMessage(null)
      setIsUploading(true)

      const fileList = Array.from(files)
      const uploadedItems: HomeworkVideoItem[] = []

      for (let i = 0; i < fileList.length; i++) {
         const file = fileList[i]

         if (file.size > 500 * 1024 * 1024) {
            setErrorMessage(`Файл "${file.name}" превышает лимит 500 МБ`)
            continue
         }

         setUploadProgressText(`Загрузка ${i + 1} из ${fileList.length}... 0%`)

         try {
            const { uploadUrl, publicUrl, key } =
               await homeworkApi.getPresignedUploadUrl(file)

            await homeworkApi.uploadFileWithProgress(
               uploadUrl,
               file,
               (percent) => {
                  setUploadProgressText(
                     `Загрузка ${i + 1} из ${fileList.length}... ${percent}%`,
                  )
               },
            )

            uploadedItems.push({
               id: crypto.randomUUID(),
               url: publicUrl,
               key,
               title: file.name.replace(/\.[^/.]+$/, ''),
            })
         } catch (err) {
            console.error(err)
            setErrorMessage(`Не удалось загрузить "${file.name}"`)
         }
      }

      setVideos((prev) => [...prev, ...uploadedItems])
      setIsUploading(false)
      setUploadProgressText(null)
      e.target.value = ''
   }

   const handleRemoveVideo = (id: string) => {
      setVideos((prev) => prev.filter((v) => v.id !== id))
   }

   const handleSave = async () => {
      if (!description.trim()) {
         setErrorMessage('Укажите описание задания')
         return
      }

      try {
         if (editingItem) {
            await updateHomework({
               id: editingItem.id,
               title: title.trim() || null,
               description: description.trim(),
               videos,
               videoUrl: videos[0]?.url || null,
               videoKey: videos[0]?.key || null,
               unlockDate: unlockDate
                  ? new Date(unlockDate).toISOString()
                  : null,
            })
         } else {
            await createHomework({
               date,
               title: title.trim() || null,
               description: description.trim(),
               videos,
               videoUrl: videos[0]?.url || null,
               videoKey: videos[0]?.key || null,
               unlockDate: unlockDate
                  ? new Date(unlockDate).toISOString()
                  : null,
            })
         }
         resetForm()
      } catch (err) {
         console.error(err)
         setErrorMessage('Не удалось сохранить задание')
      }
   }

   const handleDelete = async (homeworkId: string) => {
      if (!confirm('Удалить это задание?')) return
      try {
         await deleteHomework(homeworkId)
      } catch (err) {
         console.error(err)
         setErrorMessage('Не удалось удалить задание')
      }
   }

   if (isLoading) {
      return (
         <div className="py-12 flex flex-col items-center justify-center text-xs text-[#8B857D] gap-2">
            <div className="w-5 h-5 border-2 border-[#8BA888] border-t-transparent rounded-full animate-spin" />
            <span>Загрузка домашних заданий...</span>
         </div>
      )
   }

   const isFormOpen = isCreatingNew || editingItem !== null

   return (
      <div className="flex flex-col gap-4 py-1">
         <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#3E3A35]">
               Задания к занятию ({homeworks.length})
            </span>

            {canEdit && !isFormOpen && homeworks.length > 0 && (
               <button
                  type="button"
                  onClick={startCreate}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#8BA888] text-white hover:bg-[#7A9A77] transition-colors shadow-2xs"
               >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Добавить задание</span>
               </button>
            )}
         </div>

         {isFormOpen && (
            <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E5E0D8] flex flex-col gap-3.5">
               <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#3E3A35]">
                     {editingItem ? 'Редактирование задания' : 'Новое задание'}
                  </span>
                  <button
                     type="button"
                     onClick={resetForm}
                     className="p-1 rounded-lg text-[#8B857D] hover:bg-neutral-200"
                  >
                     <X className="w-4 h-4" />
                  </button>
               </div>

               {errorMessage && (
                  <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs">
                     {errorMessage}
                  </div>
               )}

               <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-[#8B857D] uppercase tracking-wider">
                     Тема задания
                  </label>
                  <input
                     type="text"
                     value={title}
                     onChange={(e) => setTitle(e.target.value)}
                     placeholder="Например: Задание 1. Дактиль и числа"
                     className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#E5E0D8] focus:outline-none focus:border-[#8BA888]"
                  />
               </div>

               <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-[#8B857D] uppercase tracking-wider">
                     Описание задания *
                  </label>
                  <textarea
                     rows={3}
                     value={description}
                     onChange={(e) => setDescription(e.target.value)}
                     placeholder="Опишите, что необходимо выполнить..."
                     className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#E5E0D8] focus:outline-none focus:border-[#8BA888] resize-none"
                  />
               </div>

               <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-[#8B857D] uppercase tracking-wider">
                     Дата открытия (опционально)
                  </label>
                  <input
                     type="datetime-local"
                     value={unlockDate}
                     onChange={(e) => setUnlockDate(e.target.value)}
                     className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#E5E0D8] focus:outline-none focus:border-[#8BA888]"
                  />
               </div>

               <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                     <label className="text-[11px] font-semibold text-[#8B857D] uppercase tracking-wider flex items-center gap-1">
                        <Film className="w-3.5 h-3.5 text-[#8BA888]" />
                        <span>Прикрепленные видео ({videos.length})</span>
                     </label>
                  </div>

                  {videos.length > 0 && (
                     <div className="flex flex-col gap-2.5">
                        {videos.map((v, idx) => (
                           <div
                              key={v.id}
                              className="p-2.5 bg-white rounded-xl border border-[#E5E0D8] flex flex-col gap-2"
                           >
                              <div className="flex items-center justify-between gap-2">
                                 <input
                                    type="text"
                                    value={v.title || `Видео ${idx + 1}`}
                                    onChange={(e) => {
                                       const updatedTitle = e.target.value
                                       setVideos((prev) =>
                                          prev.map((item) =>
                                             item.id === v.id
                                                ? {
                                                     ...item,
                                                     title: updatedTitle,
                                                  }
                                                : item,
                                          ),
                                       )
                                    }}
                                    className="text-xs font-semibold text-[#3E3A35] bg-transparent border-b border-transparent hover:border-[#E5E0D8] focus:border-[#8BA888] focus:outline-none w-full"
                                 />
                                 <button
                                    type="button"
                                    onClick={() => handleRemoveVideo(v.id)}
                                    className="p-1 rounded-md text-red-500 hover:bg-red-50 shrink-0"
                                    title="Удалить видео"
                                 >
                                    <Trash2 className="w-3.5 h-3.5" />
                                 </button>
                              </div>
                              <SignVideoPlayer src={v.url} />
                           </div>
                        ))}
                     </div>
                  )}

                  <label className="border-2 border-dashed border-[#E5E0D8] hover:border-[#8BA888] bg-white rounded-xl p-3.5 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors">
                     <input
                        type="file"
                        accept="video/*"
                        multiple
                        onChange={handleMultipleFilesUpload}
                        disabled={isUploading}
                        className="hidden"
                     />
                     <UploadCloud className="w-5 h-5 text-[#8BA888]" />
                     <span className="text-xs font-medium text-[#3E3A35]">
                        {isUploading
                           ? uploadProgressText || 'Загрузка видео...'
                           : videos.length === 0
                             ? 'Выбрать видеозаписи (можно несколько)'
                             : '+ Прикрепить ещё видео'}
                     </span>
                     <span className="text-[10px] text-[#8B857D]">
                        MP4, MOV, WebM до 500 МБ
                     </span>
                  </label>
               </div>

               <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5E0D8]">
                  <button
                     type="button"
                     onClick={resetForm}
                     className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#8B857D]"
                  >
                     Отмена
                  </button>
                  <button
                     type="button"
                     onClick={handleSave}
                     disabled={isCreating || isUpdating || isUploading}
                     className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#8BA888] text-white hover:bg-[#7A9A77] disabled:opacity-50"
                  >
                     <Check className="w-4 h-4" />
                     <span>
                        {isCreating || isUpdating
                           ? 'Сохранение...'
                           : 'Сохранить задание'}
                     </span>
                  </button>
               </div>
            </div>
         )}

         {homeworks.length === 0 && !isFormOpen && (
            <div className="py-10 flex flex-col items-center justify-center text-center gap-3">
               <div className="w-10 h-10 rounded-2xl bg-[#FAF8F5] border border-[#E5E0D8] text-[#8B857D] flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
               </div>
               <div>
                  <h4 className="text-xs font-bold text-[#3E3A35]">
                     Домашние задания не добавлены
                  </h4>
                  <p className="text-[11px] text-[#8B857D] mt-0.5">
                     Материалы к этому занятию пока отсутствуют
                  </p>
               </div>
               {canEdit && (
                  <button
                     type="button"
                     onClick={startCreate}
                     className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#8BA888] text-white hover:bg-[#7A9A77] shadow-xs"
                  >
                     <Plus className="w-4 h-4" />
                     <span>Создать первое задание</span>
                  </button>
               )}
            </div>
         )}

         <div className="flex flex-col gap-3">
            {homeworks.map((item, index) => {
               if (item.isLocked) {
                  return (
                     <div
                        key={item.id}
                        className="p-3.5 rounded-2xl border border-dashed border-[#E5E0D8] bg-[#FDFCFB] flex items-center gap-3 text-[#8B857D]"
                     >
                        <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                           <Lock className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                           <span className="text-xs font-semibold text-[#3E3A35]">
                              {item.title || `Задание ${index + 1}`}
                           </span>
                           <span className="text-[10px] text-[#8B857D] flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3 h-3" />
                              Откроется:{' '}
                              {item.unlockDate
                                 ? new Date(item.unlockDate).toLocaleString(
                                      'ru-RU',
                                      {
                                         day: 'numeric',
                                         month: 'long',
                                         hour: '2-digit',
                                         minute: '2-digit',
                                      },
                                   )
                                 : 'по расписанию'}
                           </span>
                        </div>
                     </div>
                  )
               }

               const itemVideos: HomeworkVideoItem[] =
                  item.videos && item.videos.length > 0
                     ? item.videos
                     : item.videoUrl
                       ? [
                            {
                               id: '1',
                               url: item.videoUrl,
                               key: item.videoKey || '',
                               title: 'Видео 1',
                            },
                         ]
                       : []

               const activeVideoIndex = selectedVideoIndices[item.id] || 0
               const currentVideo =
                  itemVideos[activeVideoIndex] || itemVideos[0]

               return (
                  <div
                     key={item.id}
                     className="p-3.5 sm:p-4 rounded-2xl border border-[#E5E0D8] bg-white shadow-2xs flex flex-col gap-3"
                  >
                     <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-col">
                           <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#FAF8F5] border border-[#E5E0D8] text-[#8B857D]">
                                 #{index + 1}
                              </span>
                              <h4 className="text-xs font-bold text-[#3E3A35]">
                                 {item.title || `Задание ${index + 1}`}
                              </h4>
                           </div>
                           {item.author && (
                              <span className="text-[10px] text-[#8B857D] mt-0.5">
                                 Преподаватель: {item.author.name}
                              </span>
                           )}
                        </div>

                        {canEdit && (
                           <div className="flex items-center gap-1">
                              <button
                                 type="button"
                                 onClick={() => startEdit(item)}
                                 className="p-1.5 rounded-lg text-[#8B857D] hover:bg-[#FAF8F5]"
                              >
                                 <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                 type="button"
                                 onClick={() => handleDelete(item.id)}
                                 className="p-1.5 rounded-lg text-red-400 hover:bg-red-50"
                              >
                                 <Trash2 className="w-3.5 h-3.5" />
                              </button>
                           </div>
                        )}
                     </div>

                     {itemVideos.length > 0 && (
                        <div className="flex flex-col gap-2">
                           {itemVideos.length > 1 && (
                              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                                 {itemVideos.map((vid, vidIdx) => (
                                    <button
                                       key={vid.id}
                                       type="button"
                                       onClick={() =>
                                          setSelectedVideoIndices((prev) => ({
                                             ...prev,
                                             [item.id]: vidIdx,
                                          }))
                                       }
                                       className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold shrink-0 transition-colors ${
                                          activeVideoIndex === vidIdx
                                             ? 'bg-[#8BA888] text-white'
                                             : 'bg-[#FAF8F5] text-[#8B857D] hover:text-[#3E3A35] border border-[#E5E0D8]'
                                       }`}
                                    >
                                       {vid.title || `Видео ${vidIdx + 1}`}
                                    </button>
                                 ))}
                              </div>
                           )}

                           {currentVideo && (
                              <div className="flex flex-col gap-1">
                                 <span className="text-[10px] font-semibold text-[#8B857D] uppercase tracking-wider flex items-center gap-1">
                                    <Video className="w-3.5 h-3.5" />
                                    {currentVideo.title || 'Видеоматериал'}
                                 </span>
                                 <SignVideoPlayer src={currentVideo.url} />
                              </div>
                           )}
                        </div>
                     )}

                     <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E5E0D8]">
                        <p className="text-xs text-[#3E3A35] whitespace-pre-wrap leading-relaxed">
                           {item.description}
                        </p>
                     </div>

                     {item.unlockDate && canEdit && (
                        <span className="text-[10px] text-amber-600 flex items-center gap-1 font-medium">
                           <Calendar className="w-3 h-3" />
                           Доступно с:{' '}
                           {new Date(item.unlockDate).toLocaleString('ru-RU', {
                              day: 'numeric',
                              month: 'long',
                              hour: '2-digit',
                              minute: '2-digit',
                           })}
                        </span>
                     )}
                  </div>
               )
            })}
         </div>
      </div>
   )
}
