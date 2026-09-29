'use client'

import { useState, useRef, useEffect } from 'react'
import {
   Play,
   Pause,
   RotateCcw,
   RotateCw,
   FlipHorizontal,
   Maximize,
   Volume2,
   VolumeX,
} from 'lucide-react'

interface SignVideoPlayerProps {
   src: string
}

const PLAYBACK_RATES = [0.5, 0.75, 1.0, 1.25, 1.5]

export function SignVideoPlayer({ src }: SignVideoPlayerProps) {
   const videoRef = useRef<HTMLVideoElement>(null)
   const containerRef = useRef<HTMLDivElement>(null)

   const [isPlaying, setIsPlaying] = useState(false)
   const [isMirrored, setIsMirrored] = useState(false)
   const [playbackRate, setPlaybackRate] = useState(1.0)
   const [currentTime, setCurrentTime] = useState(0)
   const [duration, setDuration] = useState(0)
   const [isMuted, setIsMuted] = useState(false)

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

   const changeSpeed = (rate: number) => {
      if (!videoRef.current) return
      videoRef.current.playbackRate = rate
      setPlaybackRate(rate)
   }

   const toggleMute = () => {
      if (!videoRef.current) return
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
   }

   const toggleFullscreen = () => {
      if (!containerRef.current) return
      if (document.fullscreenElement) {
         document.exitFullscreen()
      } else {
         containerRef.current.requestFullscreen()
      }
   }

   const formatTime = (timeInSeconds: number) => {
      const minutes = Math.floor(timeInSeconds / 60)
      const seconds = Math.floor(timeInSeconds % 60)
      return `${minutes}:${seconds.toString().padStart(2, '0')}`
   }

   return (
      <div
         ref={containerRef}
         className="relative flex flex-col bg-black rounded-xl overflow-hidden shadow-md group select-none"
      >
         <div
            className="relative aspect-video flex items-center justify-center cursor-pointer bg-neutral-900"
            onClick={togglePlay}
         >
            <video
               ref={videoRef}
               src={src}
               playsInline
               className="w-full h-full object-contain transition-transform duration-200"
               style={{ transform: isMirrored ? 'scaleX(-1)' : 'none' }}
            />

            {!isPlaying && (
               <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="w-12 h-12 rounded-full bg-white/90 text-neutral-800 flex items-center justify-center pl-0.5 shadow-lg">
                     <Play className="w-6 h-6 fill-current" />
                  </div>
               </div>
            )}
         </div>

         <div className="p-3 bg-neutral-900/95 border-t border-neutral-800 flex flex-col gap-2">
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
               className="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-[#8BA888]"
            />

            <div className="flex items-center justify-between text-xs text-neutral-300">
               <div className="flex items-center gap-2">
                  <button
                     type="button"
                     onClick={togglePlay}
                     className="p-1.5 hover:bg-neutral-800 rounded-md transition-colors"
                  >
                     {isPlaying ? (
                        <Pause className="w-4 h-4" />
                     ) : (
                        <Play className="w-4 h-4 fill-current" />
                     )}
                  </button>

                  <button
                     type="button"
                     onClick={() => handleSeek(-5)}
                     className="p-1.5 hover:bg-neutral-800 rounded-md transition-colors"
                  >
                     <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                     type="button"
                     onClick={() => handleSeek(5)}
                     className="p-1.5 hover:bg-neutral-800 rounded-md transition-colors"
                  >
                     <RotateCw className="w-4 h-4" />
                  </button>

                  <button
                     type="button"
                     onClick={toggleMute}
                     className="p-1.5 hover:bg-neutral-800 rounded-md transition-colors"
                  >
                     {isMuted ? (
                        <VolumeX className="w-4 h-4 text-red-400" />
                     ) : (
                        <Volume2 className="w-4 h-4" />
                     )}
                  </button>

                  <span className="font-mono text-[11px] text-neutral-400">
                     {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
               </div>

               <div className="flex items-center gap-1.5">
                  <button
                     type="button"
                     onClick={() => setIsMirrored(!isMirrored)}
                     className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                        isMirrored
                           ? 'bg-[#8BA888] text-white'
                           : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                     }`}
                  >
                     <FlipHorizontal className="w-3.5 h-3.5" />
                     <span>Зеркало</span>
                  </button>

                  <div className="flex items-center bg-neutral-800 rounded-md p-0.5">
                     {PLAYBACK_RATES.map((rate) => (
                        <button
                           key={rate}
                           type="button"
                           onClick={() => changeSpeed(rate)}
                           className={`px-1.5 py-0.5 text-[10px] rounded font-mono transition-colors ${
                              playbackRate === rate
                                 ? 'bg-[#8BA888] text-white font-bold'
                                 : 'text-neutral-400 hover:text-white'
                           }`}
                        >
                           {rate}x
                        </button>
                     ))}
                  </div>

                  <button
                     type="button"
                     onClick={toggleFullscreen}
                     className="p-1.5 hover:bg-neutral-800 rounded-md transition-colors"
                  >
                     <Maximize className="w-4 h-4" />
                  </button>
               </div>
            </div>
         </div>
      </div>
   )
}
