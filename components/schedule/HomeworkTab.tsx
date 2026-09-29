'use client'

import { useState } from 'react'
import {
   useHomeworkQuery,
   useHomeworkMutations,
} from '@/hooks/useHomeworkQueries'
import { homeworkApi } from '@/services/homeworkApi'
import { SignVideoPlayer } from '@/components/schedule/SignVideoPlayer'
import {
   UploadCloud,
   Trash2,
   Edit3,
   Check,
   BookOpen,
   Video,
} from 'lucide-react'

interface HomeworkTabProps {
   lessonId: string
   date: string
   canEdit: boolean
}

export function HomeworkTab({ lessonId, date, canEdit }: HomeworkTabProps) {
   const { data, isLoading } = useHomeworkQuery(lessonId, date)
   const { saveHomework, deleteHomework, isSaving, isDeleting } =
      useHomeworkMutations(lessonId, date)

   const [isEditing, setIsEditing] = useState(false)
   const [title, setTitle] = useState('')
   const [description, setDescription] = useState('')
   const [videoUrl, setVideoUrl] = useState('')
   const [videoKey, setVideoKey] = useState('')

   const [uploadProgress, setUploadProgress] = useState<number | null>(null)
   const [isUploading, setIsUploading] = useState(false)
   const [errorMessage, setErrorMessage] = useState<string | null>(null)

   const homework = data?.homework

   const handleStartEditing = () => {
      setTitle(homework?.title || '')
      setDescription(homework?.description || '')
      setVideoUrl(homework?.videoUrl || '')
      setVideoKey(homework?.videoKey || '')
      setErrorMessage(null)
      setIsEditing(true)
   }

   const handleCancelEditing = () => {
      setIsEditing(false)
      setUploadProgress(null)
      setIsUploading(false)
      setErrorMessage(null)
   }

   const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      if (file.size > 500 * 1024 * 1024) {
         setErrorMessage('Размер видео не должен превышать 500 МБ')
         return
      }

      setErrorMessage(null)
      setIsUploading(true)
      setUploadProgress(0)

      try {
         const { uploadUrl, publicUrl, key } =
            await homeworkApi.getPresignedUploadUrl(file)

         await homeworkApi.uploadFileWithProgress(
            uploadUrl,
            file,
            (progress) => {
               setUploadProgress(progress)
            },
         )

         setVideoUrl(publicUrl)
         setVideoKey(key)
      } catch (err) {
         console.error(err)
         setErrorMessage('Не удалось загрузить видео')
      } finally {
         setIsUploading(false)
         setUploadProgress(null)
      }
   }

   const handleSave = async () => {
      if (!description.trim()) {
         setErrorMessage('Укажите описание домашнего задания')
         return
      }

      try {
         await saveHomework({
            date,
            title: title.trim() || null,
            description: description.trim(),
            videoUrl: videoUrl || null,
            videoKey: videoKey || null,
         })
         setIsEditing(false)
      } catch (err) {
         console.error(err)
         setErrorMessage('Не удалось сохранить задание')
      }
   }

   const handleDelete = async () => {
      if (!confirm('Удалить домашнее задание?')) return
      try {
         await deleteHomework()
      } catch (err) {
         console.error(err)
         setErrorMessage('Не удалось удалить задание')
      }
   }

   if (isLoading) {
      return (
         <div className="py-12 flex flex-col items-center justify-center text-xs text-[#8B857D] gap-2">
            <div className="w-5 h-5 border-2 border-[#8BA888] border-t-transparent rounded-full animate-spin" />
            <span>Загрузка домашнего задания...</span>
         </div>
      )
   }

   if (isEditing) {
      return (
         <div className="flex flex-col gap-4 py-2">
            {errorMessage && (
               <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs">
                  {errorMessage}
               </div>
            )}

            <div className="flex flex-col gap-1.5">
               <label className="text-[11px] font-semibold text-[#8B857D] uppercase tracking-wider">
                  Тема задания
               </label>
               <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Тема или урок..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#E5E0D8] focus:outline-none focus:border-[#8BA888] transition-colors"
               />
            </div>

            <div className="flex flex-col gap-1.5">
               <label className="text-[11px] font-semibold text-[#8B857D] uppercase tracking-wider">
                  Описание задания
               </label>
               <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Опишите, что нужно повторить или подготовить..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#E5E0D8] focus:outline-none focus:border-[#8BA888] transition-colors resize-none"
               />
            </div>

            <div className="flex flex-col gap-2">
               <label className="text-[11px] font-semibold text-[#8B857D] uppercase tracking-wider">
                  Видеозапись
               </label>

               {videoUrl ? (
                  <div className="flex flex-col gap-2">
                     <SignVideoPlayer src={videoUrl} />
                     <button
                        type="button"
                        onClick={() => {
                           setVideoUrl('')
                           setVideoKey('')
                        }}
                        className="self-start text-[11px] text-red-500 hover:text-red-600 flex items-center gap-1 font-medium transition-colors"
                     >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Удалить видео</span>
                     </button>
                  </div>
               ) : (
                  <label className="relative border-2 border-dashed border-[#E5E0D8] hover:border-[#8BA888] bg-white rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors">
                     <input
                        type="file"
                        accept="video/*"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                        className="hidden"
                     />
                     <div className="w-9 h-9 rounded-full bg-[#FAF8F5] text-[#8BA888] flex items-center justify-center">
                        <UploadCloud className="w-5 h-5" />
                     </div>
                     <span className="text-xs font-medium text-[#3E3A35]">
                        {isUploading
                           ? `Загрузка... ${uploadProgress || 0}%`
                           : 'Выбрать видеозапись для загрузки'}
                     </span>
                     <span className="text-[10px] text-[#8B857D]">
                        MP4, MOV, WebM до 500 МБ
                     </span>

                     {isUploading && (
                        <div className="w-full max-w-[200px] h-1.5 bg-[#FAF8F5] rounded-full overflow-hidden mt-1">
                           <div
                              className="h-full bg-[#8BA888] transition-all duration-150"
                              style={{ width: `${uploadProgress || 0}%` }}
                           />
                        </div>
                     )}
                  </label>
               )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5E0D8]">
               <button
                  type="button"
                  onClick={handleCancelEditing}
                  disabled={isSaving || isUploading}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#8B857D] hover:bg-[#FAF8F5] transition-colors"
               >
                  Отмена
               </button>

               <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving || isUploading}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#8BA888] text-white hover:bg-[#7A9A77] transition-colors disabled:opacity-50"
               >
                  <Check className="w-4 h-4" />
                  <span>{isSaving ? 'Сохранение...' : 'Сохранить'}</span>
               </button>
            </div>
         </div>
      )
   }

   if (!homework) {
      return (
         <div className="py-10 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF8F5] border border-[#E5E0D8] text-[#8B857D] flex items-center justify-center">
               <BookOpen className="w-6 h-6" />
            </div>
            <div>
               <h4 className="text-xs font-bold text-[#3E3A35]">
                  Домашнее задание не задано
               </h4>
               <p className="text-[11px] text-[#8B857D] mt-0.5">
                  Материалы для этого занятия пока отсутствуют
               </p>
            </div>

            {canEdit && (
               <button
                  type="button"
                  onClick={handleStartEditing}
                  className="mt-1 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#8BA888] text-white hover:bg-[#7A9A77] transition-colors shadow-xs"
               >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Добавить домашнее задание</span>
               </button>
            )}
         </div>
      )
   }

   return (
      <div className="flex flex-col gap-4 py-1">
         <div className="flex items-start justify-between gap-3">
            <div>
               <h3 className="text-sm font-bold text-[#3E3A35]">
                  {homework.title || 'Домашнее задание'}
               </h3>
               {homework.author && (
                  <span className="text-[11px] text-[#8B857D]">
                     Автор: {homework.author.name}
                  </span>
               )}
            </div>

            {canEdit && (
               <div className="flex items-center gap-1">
                  <button
                     type="button"
                     onClick={handleStartEditing}
                     className="p-1.5 rounded-lg text-[#8B857D] hover:bg-[#FAF8F5] hover:text-[#3E3A35] transition-colors"
                  >
                     <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                     type="button"
                     onClick={handleDelete}
                     disabled={isDeleting}
                     className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                     <Trash2 className="w-4 h-4" />
                  </button>
               </div>
            )}
         </div>

         {homework.videoUrl && (
            <div className="flex flex-col gap-1.5">
               <span className="text-[11px] font-semibold text-[#8B857D] uppercase tracking-wider flex items-center gap-1">
                  <Video className="w-3.5 h-3.5" />
                  Видеозапись
               </span>
               <SignVideoPlayer src={homework.videoUrl} />
            </div>
         )}

         <div className="flex flex-col gap-1 bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E5E0D8]">
            <span className="text-[10px] font-semibold text-[#8B857D] uppercase tracking-wider">
               Инструкция к заданию
            </span>
            <p className="text-xs text-[#3E3A35] whitespace-pre-wrap leading-relaxed">
               {homework.description}
            </p>
         </div>
      </div>
   )
}
