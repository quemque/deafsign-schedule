'use client'

import { useState, useRef, useEffect } from 'react'
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
} from 'lucide-react'

interface SignVideoPlayerProps {
   src: string
}

const PLAYBACK_RATES = [0.5, 0.75, 1.0, 1.25]

export function SignVideoPlayer({ src }: SignVideoPlayerProps) {
   const videoRef = useRef<HTMLVideoElement>(null)
   const containerRef = useRef<HTMLDivElement>(null)

   const [isPlaying, setIsPlaying] = useState(false)
   const [isMirrored, setIsMirrored] = useState(false)
   const [isZoomed, setIsZoomed] = useState(false)
   const [playbackRate, setPlaybackRate] = useState(1.0)
   const [currentTime, setCurrentTime] = useState(0)
   const [duration, setDuration] = useState(0)
   const [isMuted, setIsMuted] = useState(false)
   const [isFullscreen, setIsFullscreen] = useState(false)

   useEffect(() => {
      const handleFullscreenChange = () => {
         setIsFullscreen(Boolean(document.fullscreenElement))
      }

      document.addEventListener('fullscreenchange', handleFullscreenChange)
      return () => {
         document.removeEventListener(
            'fullscreenchange',
            handleFullscreenChange,
         )
      }
   }, [])

   useEffect(() => {
      const video = videoRef.current
      if (!video) return

      const onTimeUpdate = () => setCurrentTime(video.currentTime)
      const onLoadedMetadata = () => setDuration(video.duration)
      const onEnded = () => setIsPlaying(false)

      video.addEventListener('timeupdate', onTimeUpdate)
      video.addEventListener('loadedmetadata', onLoadedMetadata)
      video.addEventListener('ended', onEnded)

      return () => {
         video.removeEventListener('timeupdate', onTimeUpdate)
         video.removeEventListener('loadedmetadata', onLoadedMetadata)
         video.removeEventListener('ended', onEnded)
      }
   }, [])

   const togglePlay = () => {
      if (!videoRef.current) return
      if (isPlaying) {
         videoRef.current.pause()
         setIsPlaying(false)
      } else {
         videoRef.current.play()
         setIsPlaying(true)
      }
   }

   const handleSeek = (seconds: number) => {
      if (!videoRef.current) return
      videoRef.current.currentTime = Math.min(
         Math.max(videoRef.current.currentTime + seconds, 0),
         duration,
      )
   }

   const cyclePlaybackRate = () => {
      if (!videoRef.current) return
      const currentIndex = PLAYBACK_RATES.indexOf(playbackRate)
      const nextIndex = (currentIndex + 1) % PLAYBACK_RATES.length
      const nextRate = PLAYBACK_RATES[nextIndex]
      videoRef.current.playbackRate = nextRate
      setPlaybackRate(nextRate)
   }

   const toggleMute = () => {
      if (!videoRef.current) return
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
   }

   const toggleFullscreen = () => {
      const container = containerRef.current
      const video = videoRef.current as any
      if (!container) return

      if (document.fullscreenElement) {
         document.exitFullscreen().catch(() => {})
      } else if (container.requestFullscreen) {
         container.requestFullscreen().catch(() => {
            if (video?.webkitEnterFullscreen) {
               video.webkitEnterFullscreen()
            }
         })
      } else if (video?.webkitEnterFullscreen) {
         video.webkitEnterFullscreen()
      }
   }

   const formatTime = (timeInSeconds: number) => {
      const minutes = Math.floor(timeInSeconds / 60)
      const seconds = Math.floor(timeInSeconds % 60)
      return `${minutes}:${seconds.toString().padStart(2, '0')}`
   }

   let videoTransform = ''
   if (isMirrored) videoTransform += ' scaleX(-1)'
   if (isZoomed) videoTransform += ' scale(1.35)'

   return (
      <div
         ref={containerRef}
         className={`relative flex flex-col bg-black overflow-hidden shadow-sm select-none ${
            isFullscreen
               ? 'fixed inset-0 z-9999 w-full h-full rounded-none'
               : '-mx-3 sm:mx-0 rounded-none sm:rounded-xl'
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
               src={src}
               playsInline
               className="max-w-full max-h-full w-auto h-auto object-contain transition-transform duration-300 origin-center"
               style={{ transform: videoTransform.trim() || undefined }}
            />

            {!isPlaying && (
               <div className="absolute inset-0 flex items-center justify-center bg-black/35 pointer-events-none">
                  <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-white/95 text-neutral-800 flex items-center justify-center pl-0.5 shadow-xl">
                     <Play className="w-5 h-5 sm:w-7 sm:h-7 fill-current" />
                  </div>
               </div>
            )}
         </div>

         <div className="p-2 sm:p-2.5 bg-neutral-900 border-t border-neutral-800 flex flex-col gap-1.5 shrink-0">
            <input
               type="range"
               min={0}
               max={duration || 100}
               value={currentTime}
               onChange={(e) => {
                  if (videoRef.current) {
                     videoRef.current.currentTime = Number(e.target.value)
                  }
               }}
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
                     onClick={() => handleSeek(-5)}
                     className="p-1 sm:p-1.5 hover:bg-neutral-800 rounded-md transition-colors"
                     title="Назад на 5 секунд"
                  >
                     <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>

                  <button
                     type="button"
                     onClick={() => handleSeek(5)}
                     className="p-1 sm:p-1.5 hover:bg-neutral-800 rounded-md transition-colors"
                     title="Вперед на 5 секунд"
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
                     {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
               </div>

               <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                  <button
                     type="button"
                     onClick={() => setIsZoomed(!isZoomed)}
                     className={`p-1 sm:px-2 sm:py-1 rounded-md text-[11px] font-medium transition-colors ${
                        isZoomed
                           ? 'bg-[#8BA888] text-white'
                           : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                     }`}
                     title="Приближение жестов"
                  >
                     <ZoomIn className="w-3.5 h-3.5" />
                  </button>

                  <button
                     type="button"
                     onClick={() => setIsMirrored(!isMirrored)}
                     className={`p-1 sm:px-2 sm:py-1 rounded-md text-[11px] font-medium transition-colors ${
                        isMirrored
                           ? 'bg-[#8BA888] text-white'
                           : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                     }`}
                     title="Зеркальный режим"
                  >
                     <FlipHorizontal className="w-3.5 h-3.5" />
                  </button>

                  <button
                     type="button"
                     onClick={cyclePlaybackRate}
                     className="px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-neutral-800 text-[#8BA888] hover:bg-neutral-700 transition-colors"
                     title="Скорость воспроизведения"
                  >
                     {playbackRate}x
                  </button>

                  <button
                     type="button"
                     onClick={toggleFullscreen}
                     className="p-1 sm:p-1.5 hover:bg-neutral-800 rounded-md transition-colors text-white shrink-0"
                     title={
                        isFullscreen
                           ? 'Выйти из полноэкранного режима'
                           : 'На весь экран'
                     }
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
