'use client'

import { useState, useRef, useEffect } from 'react'

interface ExtendedVideoElement extends HTMLVideoElement {
   webkitEnterFullscreen?: () => void
}

export function useVideoPlayer(
   playbackRates: number[] = [0.5, 0.75, 1.0, 1.25],
) {
   const videoRef = useRef<ExtendedVideoElement>(null)
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

   const seek = (seconds: number) => {
      if (!videoRef.current) return
      videoRef.current.currentTime = Math.min(
         Math.max(videoRef.current.currentTime + seconds, 0),
         duration,
      )
   }

   const setTime = (time: number) => {
      if (!videoRef.current) return
      videoRef.current.currentTime = time
      setCurrentTime(time)
   }

   const cyclePlaybackRate = () => {
      if (!videoRef.current) return
      const currentIndex = playbackRates.indexOf(playbackRate)
      const nextIndex = (currentIndex + 1) % playbackRates.length
      const nextRate = playbackRates[nextIndex]
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
      const video = videoRef.current
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

   let transform = ''
   if (isMirrored) transform += ' scaleX(-1)'
   if (isZoomed) transform += ' scale(1.35)'

   return {
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
      videoTransform: transform.trim() || undefined,
      togglePlay,
      seek,
      setTime,
      cyclePlaybackRate,
      toggleMute,
      toggleFullscreen,
      setIsMirrored: () => setIsMirrored((prev) => !prev),
      setIsZoomed: () => setIsZoomed((prev) => !prev),
      formattedTime: `${formatTime(currentTime)} / ${formatTime(duration)}`,
   }
}
