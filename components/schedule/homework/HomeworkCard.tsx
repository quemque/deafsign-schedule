'use client'

import { useState } from 'react'
import { Edit3, Trash2, Video, Calendar } from 'lucide-react'
import { SignVideoPlayer } from '../player/SignVideoPlayer'
import type { Homework, HomeworkVideoItem } from '@/types/schedule'

interface CardProps {
   item: Homework
   index: number
   canEdit: boolean
   onEdit: (item: Homework) => void
   onDelete: (id: string) => void
}

export function HomeworkCard({
   item,
   index,
   canEdit,
   onEdit,
   onDelete,
}: CardProps) {
   const [activeVideoIndex, setActiveVideoIndex] = useState(0)

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

   const currentVideo = itemVideos[activeVideoIndex] || itemVideos[0]

   return (
      <div className="p-3.5 sm:p-4 rounded-2xl border border-[#E5E0D8] bg-white shadow-2xs flex flex-col gap-3">
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
                     onClick={() => onEdit(item)}
                     className="p-1.5 rounded-lg text-[#8B857D] hover:bg-[#FAF8F5]"
                  >
                     <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                     type="button"
                     onClick={() => onDelete(item.id)}
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
                           onClick={() => setActiveVideoIndex(vidIdx)}
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
}
