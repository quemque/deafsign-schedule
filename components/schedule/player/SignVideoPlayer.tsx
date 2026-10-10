'use client'

import { useState, useEffect } from 'react'
import {
   Play,
   Pause,
   RotateCcw,
   RotateCw,
   FlipHorizontal,
   Maximize,
   Minimize,
   Volume2,
   VolumeX,
   ZoomIn,
   VideoOff,
   Loader2,
} from 'lucide-react'
import { useVideoPlayer } from './useVideoPlayer'

interface SignVideoPlayerProps {
   src?: string | null
   videoKey?: string | null
}

export function SignVideoPlayer({ src, videoKey }: SignVideoPlayerProps) {
   const [secureUrl, setSecureUrl] = useState<string | null>(null)
   const [isLoadingKey, setIsLoadingKey] = useState(false)

   useEffect(() => {
      if (!videoKey) return

      let isMounted = true
      setIsLoadingKey(true)

      fetch(`/api/s3/presign?key=${encodeURIComponent(videoKey)}`)
         .then((r) => (r.ok ? r.json() : null))
         .then((d) => {
            if (isMounted && d?.url) setSecureUrl(d.url)
         })
         .catch(() => {})
         .finally(() => {
            if (isMounted) setIsLoadingKey(false)
         })

      return () => {
         isMounted = false
      }
   }, [videoKey])

   const {
      videoRef,
      containerRef,
      isPlaying,
      isMirrored,
      isZoomed,
      playbackRate,
      currentTime,
      duration,
      isMuted,
      isFullscreen,
      videoTransform,
      togglePlay,
      seek,
      setTime,
      cyclePlaybackRate,
      toggleMute,
      toggleFullscreen,
      setIsMirrored,
      setIsZoomed,
      formattedTime,
   } = useVideoPlayer()

   const handleContextMenu = (e: React.MouseEvent) => {
      e.preventDefault()
   }

   const finalSrc = secureUrl || src

   if (isLoadingKey && !secureUrl) {
      return (
         <div className="aspect-video sm:aspect-16/10 bg-neutral-900 flex flex-col items-center justify-center text-neutral-500 rounded-xl border border-neutral-800 select-none">
            <Loader2 className="w-6 h-6 animate-spin mb-2 opacity-60 text-[#8BA888]" />
            <span className="text-xs font-medium">
               Защищенное подключение...
            </span>
         </div>
      )
   }

   if (!finalSrc) {
      return (
         <div className="aspect-video sm:aspect-16/10 bg-neutral-900 flex flex-col items-center justify-center text-neutral-500 rounded-xl border border-neutral-800 select-none">
            <VideoOff className="w-8 h-8 mb-2 opacity-50" />
            <span className="text-xs font-medium">Видео недоступно</span>
         </div>
      )
   }

   return (
      <div
         ref={containerRef}
         onContextMenu={handleContextMenu}
         className={`relative flex flex-col bg-black overflow-hidden shadow-xs select-none ${
            isFullscreen
               ? 'fixed inset-0 z-[9999] w-full h-full rounded-none'
               : '-mx-3.5 sm:mx-0 rounded-none sm:rounded-xl'
         }`}
      >
         <div
            className={`relative flex items-center justify-center cursor-pointer bg-neutral-950 overflow-hidden ${
               isFullscreen
                  ? 'flex-1 min-h-0 w-full h-full'
                  : 'aspect-video sm:aspect-16/10 max-h-[50vh]'
            }`}
            onClick={togglePlay}
         >
            <video
               ref={videoRef}
               src={finalSrc}
               playsInline
               controlsList="nodownload noremoteplayback"
               disablePictureInPicture
               onContextMenu={handleContextMenu}
               className="max-w-full max-h-full w-auto h-auto object-contain transition-transform duration-300 origin-center pointer-events-auto"
               style={{ transform: videoTransform }}
            />

            {!isPlaying && (
               <div className="absolute inset-0 flex items-center justify-center bg-black/35 pointer-events-none">
                  <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-white/95 text-neutral-800 flex items-center justify-center pl-0.5 shadow-xl">
                     <Play className="w-5 h-5 sm:w-7 sm:h-7 fill-current" />
                  </div>
               </div>
            )}
         </div>

         <div className="p-2 sm:p-2.5 bg-neutral-900 border-t border-neutral-800 flex flex-col gap-1.5 shrink-0 pointer-events-auto">
            <input
               type="range"
               min={0}
               max={duration || 100}
               value={currentTime}
               onChange={(e) => setTime(Number(e.target.value))}
               className="w-full h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-[#8BA888]"
            />

            <div className="flex items-center justify-between gap-1 text-xs text-neutral-300">
               <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                  <button
                     type="button"
                     onClick={togglePlay}
                     className="p-1 sm:p-1.5 hover:bg-neutral-800 rounded-md transition-colors"
                  >
                     {isPlaying ? (
                        <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                     ) : (
                        <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
                     )}
                  </button>

                  <button
                     type="button"
                     onClick={() => seek(-5)}
                     className="p-1 sm:p-1.5 hover:bg-neutral-800 rounded-md transition-colors"
                  >
                     <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>

                  <button
                     type="button"
                     onClick={() => seek(5)}
                     className="p-1 sm:p-1.5 hover:bg-neutral-800 rounded-md transition-colors"
                  >
                     <RotateCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>

                  <button
                     type="button"
                     onClick={toggleMute}
                     className="p-1 sm:p-1.5 hover:bg-neutral-800 rounded-md transition-colors hidden xs:flex"
                  >
                     {isMuted ? (
                        <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" />
                     ) : (
                        <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                     )}
                  </button>

                  <span className="font-mono text-[9px] sm:text-[11px] text-neutral-400 pl-0.5">
                     {formattedTime}
                  </span>
               </div>

               <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                  <button
                     type="button"
                     onClick={setIsZoomed}
                     className={`p-1 sm:px-2 sm:py-1 rounded-md text-[11px] font-medium transition-colors ${
                        isZoomed
                           ? 'bg-[#8BA888] text-white'
                           : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                     }`}
                  >
                     <ZoomIn className="w-3.5 h-3.5" />
                  </button>

                  <button
                     type="button"
                     onClick={setIsMirrored}
                     className={`p-1 sm:px-2 sm:py-1 rounded-md text-[11px] font-medium transition-colors ${
                        isMirrored
                           ? 'bg-[#8BA888] text-white'
                           : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                     }`}
                  >
                     <FlipHorizontal className="w-3.5 h-3.5" />
                  </button>

                  <button
                     type="button"
                     onClick={cyclePlaybackRate}
                     className="px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-neutral-800 text-[#8BA888] hover:bg-neutral-700 transition-colors"
                  >
                     {playbackRate}x
                  </button>

                  <button
                     type="button"
                     onClick={toggleFullscreen}
                     className="p-1 sm:p-1.5 hover:bg-neutral-800 rounded-md transition-colors text-white shrink-0"
                  >
                     {isFullscreen ? (
                        <Minimize className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                     ) : (
                        <Maximize className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                     )}
                  </button>
               </div>
            </div>
         </div>
      </div>
   )
}
