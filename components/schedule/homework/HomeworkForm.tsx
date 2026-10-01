'use client'

import { useState } from 'react'
import { X, Check, Film, ImageIcon, UploadCloud, Trash2 } from 'lucide-react'
import { homeworkApi } from '@/services/homeworkApi'
import { SignVideoPlayer } from '../player/SignVideoPlayer'
import type { Homework, HomeworkMediaItem } from '@/types/schedule'

interface FormProps {
   editingItem: Homework | null
   isSaving: boolean
   onCancel: () => void
   onSubmit: (payload: {
      title: string
      description: string
      videos: HomeworkMediaItem[]
      unlockDate: string | null
   }) => Promise<void>
}

export function HomeworkForm({
   editingItem,
   isSaving,
   onCancel,
   onSubmit,
}: FormProps) {
   const [title, setTitle] = useState(editingItem?.title || '')
   const [description, setDescription] = useState(
      editingItem?.description || '',
   )
   const [unlockDate, setUnlockDate] = useState(
      editingItem?.unlockDate
         ? new Date(editingItem.unlockDate).toISOString().slice(0, 16)
         : '',
   )

   const [mediaItems, setMediaItems] = useState<HomeworkMediaItem[]>(() => {
      if (editingItem?.videos && editingItem.videos.length > 0) {
         return editingItem.videos.map((m) => ({
            ...m,
            type: m.type || 'video',
         }))
      }
      if (editingItem?.videoUrl) {
         return [
            {
               id: '1',
               type: 'video',
               url: editingItem.videoUrl,
               key: editingItem.videoKey || '',
               title: 'Видео 1',
            },
         ]
      }
      return []
   })

   const [isUploading, setIsUploading] = useState(false)
   const [uploadProgressText, setUploadProgressText] = useState<string | null>(
      null,
   )
   const [errorMessage, setErrorMessage] = useState<string | null>(null)

   const handleMultipleFilesUpload = async (
      e: React.ChangeEvent<HTMLInputElement>,
   ) => {
      const files = e.target.files
      if (!files || files.length === 0) return

      setErrorMessage(null)
      setIsUploading(true)

      const fileList = Array.from(files)
      const uploadedItems: HomeworkMediaItem[] = []

      for (let i = 0; i < fileList.length; i++) {
         const file = fileList[i]
         const isImage = file.type.startsWith('image/')
         const maxLimit = isImage ? 25 * 1024 * 1024 : 500 * 1024 * 1024

         if (file.size > maxLimit) {
            setErrorMessage(
               `Файл "${file.name}" превышает допустимый размер (${isImage ? '25 МБ' : '500 МБ'})`,
            )
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
               type: isImage ? 'image' : 'video',
               url: publicUrl,
               key,
               title: file.name.replace(/\.[^/.]+$/, ''),
            })
         } catch {
            setErrorMessage(`Не удалось загрузить "${file.name}"`)
         }
      }

      setMediaItems((prev) => [...prev, ...uploadedItems])
      setIsUploading(false)
      setUploadProgressText(null)
      e.target.value = ''
   }

   const handleSave = async () => {
      if (!description.trim()) {
         setErrorMessage('Укажите описание задания')
         return
      }

      await onSubmit({
         title: title.trim(),
         description: description.trim(),
         videos: mediaItems,
         unlockDate: unlockDate ? new Date(unlockDate).toISOString() : null,
      })
   }

   const videoItems = mediaItems.filter((item) => item.type === 'video')
   const imageItems = mediaItems.filter((item) => item.type === 'image')

   return (
      <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E5E0D8] flex flex-col gap-3.5">
         <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#3E3A35]">
               {editingItem ? 'Редактирование задания' : 'Новое задание'}
            </span>
            <button
               type="button"
               onClick={onCancel}
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
            <label className="text-[11px] font-semibold text-[#8B857D] uppercase tracking-wider">
               Материалы (Видео и Фото: {mediaItems.length})
            </label>

            {videoItems.length > 0 && (
               <div className="flex flex-col gap-2.5">
                  <span className="text-[10px] font-semibold text-[#8B857D] flex items-center gap-1 uppercase tracking-wider">
                     <Film className="w-3 h-3 text-[#8BA888]" /> Видеозаписи (
                     {videoItems.length})
                  </span>
                  {videoItems.map((v, idx) => (
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
                                 setMediaItems((prev) =>
                                    prev.map((item) =>
                                       item.id === v.id
                                          ? { ...item, title: updatedTitle }
                                          : item,
                                    ),
                                 )
                              }}
                              className="text-xs font-semibold text-[#3E3A35] bg-transparent border-b border-transparent hover:border-[#E5E0D8] focus:border-[#8BA888] focus:outline-none w-full"
                           />
                           <button
                              type="button"
                              onClick={() =>
                                 setMediaItems((prev) =>
                                    prev.filter((item) => item.id !== v.id),
                                 )
                              }
                              className="p-1 rounded-md text-red-500 hover:bg-red-50 shrink-0"
                           >
                              <Trash2 className="w-3.5 h-3.5" />
                           </button>
                        </div>
                        <SignVideoPlayer src={v.url} />
                     </div>
                  ))}
               </div>
            )}

            {imageItems.length > 0 && (
               <div className="flex flex-col gap-2 pt-1">
                  <span className="text-[10px] font-semibold text-[#8B857D] flex items-center gap-1 uppercase tracking-wider">
                     <ImageIcon className="w-3 h-3 text-[#8BA888]" /> Карточки и
                     фото ({imageItems.length})
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                     {imageItems.map((img) => (
                        <div
                           key={img.id}
                           className="relative group rounded-xl border border-[#E5E0D8] overflow-hidden bg-white flex flex-col p-1.5"
                        >
                           <div className="aspect-square w-full rounded-lg overflow-hidden bg-[#FAF8F5] relative">
                              <img
                                 src={img.url}
                                 alt={img.title || 'Фото'}
                                 className="w-full h-full object-cover"
                              />
                              <button
                                 type="button"
                                 onClick={() =>
                                    setMediaItems((prev) =>
                                       prev.filter(
                                          (item) => item.id !== img.id,
                                       ),
                                    )
                                 }
                                 className="absolute top-1 right-1 p-1 rounded-md bg-black/60 text-white hover:bg-red-500 transition-colors"
                              >
                                 <Trash2 className="w-3 h-3" />
                              </button>
                           </div>
                           <input
                              type="text"
                              value={img.title || ''}
                              placeholder="Название фото"
                              onChange={(e) => {
                                 const updatedTitle = e.target.value
                                 setMediaItems((prev) =>
                                    prev.map((item) =>
                                       item.id === img.id
                                          ? { ...item, title: updatedTitle }
                                          : item,
                                    ),
                                 )
                              }}
                              className="mt-1 text-[10px] text-[#3E3A35] bg-transparent border-b border-transparent hover:border-[#E5E0D8] focus:border-[#8BA888] focus:outline-none w-full"
                           />
                        </div>
                     ))}
                  </div>
               </div>
            )}

            <label className="border-2 border-dashed border-[#E5E0D8] hover:border-[#8BA888] bg-white rounded-xl p-3.5 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors mt-1">
               <input
                  type="file"
                  accept="video/*,image/*"
                  multiple
                  onChange={handleMultipleFilesUpload}
                  disabled={isUploading}
                  className="hidden"
               />
               <UploadCloud className="w-5 h-5 text-[#8BA888]" />
               <span className="text-xs font-medium text-[#3E3A35]">
                  {isUploading
                     ? uploadProgressText || 'Загрузка материалов...'
                     : mediaItems.length === 0
                       ? 'Выбрать видеозаписи или фото (можно несколько)'
                       : '+ Прикрепить ещё видео или фото'}
               </span>
               <span className="text-[10px] text-[#8B857D]">
                  Видео до 500 МБ • Фото до 25 МБ (JPEG, PNG, WebP)
               </span>
            </label>
         </div>

         <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5E0D8]">
            <button
               type="button"
               onClick={onCancel}
               className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#8B857D]"
            >
               Отмена
            </button>
            <button
               type="button"
               onClick={handleSave}
               disabled={isSaving || isUploading}
               className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#8BA888] text-white hover:bg-[#7A9A77] disabled:opacity-50"
            >
               <Check className="w-4 h-4" />
               <span>{isSaving ? 'Сохранение...' : 'Сохранить задание'}</span>
            </button>
         </div>
      </div>
   )
}
