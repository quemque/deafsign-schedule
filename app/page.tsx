'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
   Calendar,
   ChevronLeft,
   ChevronRight,
   Clock,
   MapPin,
   Plus,
   User as UserIcon,
   X,
   Edit,
   Trash2,
   MessageSquare,
} from 'lucide-react'

import type { ApiLesson } from '@/types/type'
import { DAY_OPTIONS } from '@/const/const'

interface Teacher {
   id: string
   name: string
}

interface CurrentUser {
   id: string
   name: string
   role: 'ADMIN' | 'TEACHER' | 'USER'
}

const timeSlots = [
   '08:00',
   '09:00',
   '10:00',
   '11:00',
   '12:00',
   '13:00',
   '14:00',
   '15:00',
   '16:00',
   '17:00',
   '18:00',
   '19:00',
   '20:00',
   '21:00',
   '22:00',
]

const daysOfWeekMap = [
   { key: 'MONDAY', label: 'Пн', short: 'Mon' },
   { key: 'TUESDAY', label: 'Вт', short: 'Tue' },
   { key: 'WEDNESDAY', label: 'Ср', short: 'Wed' },
   { key: 'THURSDAY', label: 'Чт', short: 'Thu' },
   { key: 'FRIDAY', label: 'Пт', short: 'Fri' },
   { key: 'SATURDAY', label: 'Сб', short: 'Sat' },
   { key: 'SUNDAY', label: 'Вс', short: 'Sun' },
]

async function safeJson(res: Response) {
   try {
      return await res.json()
   } catch {
      return null
   }
}

function getStartOfWeek(date: Date) {
   const d = new Date(date)
   const day = d.getDay()
   const diff = d.getDate() - day + (day === 0 ? -6 : 1)
   return new Date(d.setDate(diff))
}

export default function SchedulePage() {
   const router = useRouter()

   const [lessons, setLessons] = useState<ApiLesson[]>([])
   const [teachers, setTeachers] = useState<Teacher[]>([])
   const [user, setUser] = useState<CurrentUser | null>(null)
   const [loading, setLoading] = useState(true)

   const [currentDate, setCurrentDate] = useState(new Date())
   const [currentTime, setCurrentTime] = useState(new Date())

   const [showLessonForm, setShowLessonForm] = useState(false)
   const [selectedEvent, setSelectedEvent] = useState<ApiLesson | null>(null)
   const [commentText, setCommentText] = useState('')
   const [error, setError] = useState('')

   const [mode, setMode] = useState<'once' | 'weekly'>('once')
   const [form, setForm] = useState({
      subject: '',
      comment: '',
      date: '',
      dayOfWeek: 'MONDAY',
      startTime: '09:00',
      endTime: '10:30',
   })

   const isAdmin = user?.role === 'ADMIN'
   const canEditComment = user?.role === 'ADMIN' || user?.role === 'TEACHER'

   useEffect(() => {
      fetchAll()
      const timer = setInterval(() => setCurrentTime(new Date()), 60000)
      return () => clearInterval(timer)
   }, [])

   const fetchAll = async () => {
      try {
         const [lessonsRes, meRes] = await Promise.all([
            fetch('/api/schedule'),
            fetch('/api/auth/me'),
         ])

         if (lessonsRes.ok) {
            const data = await safeJson(lessonsRes)
            if (data?.lessons) setLessons(data.lessons)
         }

         if (meRes.ok) {
            const data = await safeJson(meRes)
            if (data?.user) {
               setUser(data.user)

               if (data.user.role === 'ADMIN') {
                  const usersRes = await fetch('/api/admin/users')
                  if (usersRes.ok) {
                     const usersData = await safeJson(usersRes)
                     if (usersData?.users) {
                        setTeachers(
                           usersData.users
                              .filter(
                                 (u: { role: string }) =>
                                    u.role === 'TEACHER' || u.role === 'ADMIN',
                              )
                              .map((u: { id: string; name: string }) => ({
                                 id: u.id,
                                 name: u.name,
                              })),
                        )
                     }
                  }
               }
            }
         }
      } catch (err) {
         console.error(err)
      } finally {
         setLoading(false)
      }
   }

   const weekDates = useMemo(() => {
      const start = getStartOfWeek(currentDate)
      return daysOfWeekMap.map((d, i) => {
         const date = new Date(start)
         date.setDate(start.getDate() + i)
         return {
            ...d,
            dateObj: date,
            dateNumber: date.getDate(),
            isToday: date.toDateString() === new Date().toDateString(),
         }
      })
   }, [currentDate])

   const currentWeekLabel = useMemo(() => {
      const start = weekDates[0].dateObj
      const end = weekDates[6].dateObj
      const monthNames = [
         'января',
         'февраля',
         'марта',
         'апреля',
         'мая',
         'июня',
         'июля',
         'августа',
         'сентября',
         'октября',
         'ноября',
         'декабря',
      ]

      if (start.getMonth() === end.getMonth()) {
         return `${start.getDate()} – ${end.getDate()} ${monthNames[start.getMonth()]} ${start.getFullYear()}`
      }
      return `${start.getDate()} ${monthNames[start.getMonth()]} – ${end.getDate()} ${monthNames[end.getMonth()]} ${start.getFullYear()}`
   }, [weekDates])

   const visibleLessons = useMemo(() => {
      const start = weekDates[0].dateObj
      const end = weekDates[6].dateObj

      const startLocal = new Date(
         start.getFullYear(),
         start.getMonth(),
         start.getDate(),
      )
      const endLocal = new Date(
         end.getFullYear(),
         end.getMonth(),
         end.getDate(),
         23,
         59,
         59,
      )

      return lessons.filter((l) => {
         if (l.isRecurring) return true

         const lDate = new Date(l.startsAt)
         const utcDate = new Date(
            lDate.getUTCFullYear(),
            lDate.getUTCMonth(),
            lDate.getUTCDate(),
            lDate.getUTCHours(),
            lDate.getUTCMinutes(),
         )

         return utcDate >= startLocal && utcDate <= endLocal
      })
   }, [lessons, weekDates])

   const prevWeek = () => {
      const d = new Date(currentDate)
      d.setDate(d.getDate() - 7)
      setCurrentDate(d)
   }

   const nextWeek = () => {
      const d = new Date(currentDate)
      d.setDate(d.getDate() + 7)
      setCurrentDate(d)
   }

   const setToday = () => setCurrentDate(new Date())

   const formatTime = (iso: string) =>
      new Date(iso).toLocaleTimeString('ru-RU', {
         timeZone: 'UTC',
         hour: '2-digit',
         minute: '2-digit',
      })

   const openCreate = () => {
      setSelectedEvent(null)
      setMode('once')

      const yyyy = currentDate.getFullYear()
      const mm = String(currentDate.getMonth() + 1).padStart(2, '0')
      const dd = String(currentDate.getDate()).padStart(2, '0')

      setForm({
         subject: '',
         comment: '',
         date: `${yyyy}-${mm}-${dd}`,
         dayOfWeek: 'MONDAY',
         startTime: '09:00',
         endTime: '10:30',
      })
      setError('')
      setShowLessonForm(true)
   }

   const openEdit = (lesson: ApiLesson) => {
      const d = new Date(lesson.startsAt)
      const yyyy = d.getUTCFullYear()
      const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
      const dd = String(d.getUTCDate()).padStart(2, '0')

      setForm({
         subject: lesson.subject,
         // Убрали teacherId и room отсюда
         comment: lesson.comment || '',
         date: `${yyyy}-${mm}-${dd}`,
         dayOfWeek: lesson.dayOfWeek || 'MONDAY',
         startTime: formatTime(lesson.startsAt),
         endTime: formatTime(lesson.endsAt),
      })
      setMode(lesson.isRecurring ? 'weekly' : 'once')
      setError('')
      setShowLessonForm(true)
   }

   const submitLesson = async (e: React.FormEvent) => {
      e.preventDefault()
      setError('')

      const url = selectedEvent
         ? `/api/schedule/${selectedEvent.id}`
         : '/api/schedule'
      const method = selectedEvent ? 'PATCH' : 'POST'

      const payload = selectedEvent
         ? {
              subject: form.subject,
              // Убрали teacherId и room отсюда тоже
              comment: form.comment,
           }
         : {
              ...form,
              isRecurring: mode === 'weekly',
              startsAt:
                 mode === 'once'
                    ? `${form.date}T${form.startTime}:00Z`
                    : undefined,
              endsAt:
                 mode === 'once'
                    ? `${form.date}T${form.endTime}:00Z`
                    : undefined,
           }

      try {
         const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
         })

         const data = await safeJson(res)

         if (!res.ok) {
            setError(data?.error || `Ошибка ${res.status}`)
            return
         }

         setShowLessonForm(false)
         setSelectedEvent(null)
         fetchAll()
      } catch (err) {
         setError('Не удалось сохранить занятие')
      }
   }

   const submitComment = async () => {
      if (!selectedEvent) return
      try {
         const res = await fetch(`/api/schedule/${selectedEvent.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ comment: commentText }),
         })
         if (res.ok) {
            fetchAll()
            setSelectedEvent((prev) =>
               prev ? { ...prev, comment: commentText } : null,
            )
         }
      } catch (err) {
         console.error(err)
      }
   }

   const deleteLesson = async (id: string) => {
      if (!confirm('Удалить занятие?')) return
      try {
         await fetch(`/api/schedule/${id}`, { method: 'DELETE' })
         setSelectedEvent(null)
         setShowLessonForm(false)
         fetchAll()
      } catch (err) {
         console.error(err)
      }
   }

   const renderGridEvent = (lesson: ApiLesson, dayKey: string) => {
      const startsAt = new Date(lesson.startsAt)
      const endsAt = new Date(lesson.endsAt)

      const startMinutesFrom8 =
         (startsAt.getUTCHours() - 8) * 60 + startsAt.getUTCMinutes()
      const durationMinutes = (endsAt.getTime() - startsAt.getTime()) / 60000

      if (startMinutesFrom8 < 0) return null

      const topPx = (startMinutesFrom8 / 60) * 96
      const heightPx = Math.max((durationMinutes / 60) * 96, 56)

      return (
         <div
            key={lesson.id}
            onClick={() => {
               setSelectedEvent(lesson)
               setCommentText(lesson.comment || '')
            }}
            style={{ top: `${topPx}px`, height: `${heightPx}px` }}
            className="absolute left-1 right-1 rounded-xl p-2 sm:p-2.5 border transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] flex flex-col overflow-hidden group bg-[#E8F0E8] border-[#8BA888] text-[#3E3A35] z-10"
         >
            <div className="flex-1 min-h-0 flex flex-col">
               <div className="flex items-start justify-between gap-1 mb-1">
                  <h3 className="text-[11px] sm:text-xs font-bold leading-tight line-clamp-2 break-words flex-1">
                     {lesson.subject}
                  </h3>
                  <span className="text-[9px] sm:text-[10px] font-medium opacity-80 flex items-center gap-0.5 shrink-0 whitespace-nowrap">
                     <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />{' '}
                     {formatTime(lesson.startsAt)}
                  </span>
               </div>

               <div className="mt-auto pt-1 flex flex-col gap-0.5 border-t border-[#8BA888]/30">
                  <div className="flex items-center justify-between text-[9px] sm:text-[10px] opacity-75">
                     <span className="truncate font-medium">
                        {[lesson.teacher?.name, lesson.room]
                           .filter(Boolean)
                           .join(' • ')}
                     </span>
                     {lesson.isRecurring && (
                        <span className="text-[8px] font-bold px-1 py-0.5 rounded-sm bg-white/50 ml-1">
                           ЦИКЛ
                        </span>
                     )}
                  </div>
                  {lesson.comment && (
                     <div className="flex items-center gap-1 text-[9px] text-[#5A534A] opacity-70 italic mt-0.5">
                        <MessageSquare className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">{lesson.comment}</span>
                     </div>
                  )}
               </div>
            </div>
         </div>
      )
   }

   return (
      <div className="h-[100dvh] bg-[#FAF8F5] text-[#3E3A35] font-sans antialiased flex flex-col selection:bg-[#8BA888] selection:text-white overflow-hidden">
         {/* ОБНОВЛЕННАЯ ШАПКА */}
         <header className="shrink-0 bg-[#FDFCFB]/90 backdrop-blur-md border-b border-[#E5E0D8] px-4 lg:px-8 py-3 z-40">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
               <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#8BA888] flex items-center justify-center text-white shrink-0">
                     <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                     <h1 className="text-sm font-semibold">Расписание</h1>
                     <p className="text-[11px] text-[#8B857D]">
                        Все занятия курса
                     </p>
                  </div>
               </div>
               <div className="flex items-center gap-2">
                  {isAdmin && (
                     <button
                        onClick={() => router.push('/admin')}
                        className="hidden sm:flex px-4 py-2 text-xs font-semibold bg-[#F5F2ED] hover:bg-[#EDE8E0] text-[#3E3A35] rounded-xl transition-colors items-center gap-2"
                     >
                        Админ панель
                     </button>
                  )}
                  <button
                     onClick={() => router.push('/profile')}
                     className="p-2 sm:px-4 sm:py-2 text-xs font-semibold bg-[#F5F2ED] hover:bg-[#EDE8E0] text-[#3E3A35] rounded-xl flex items-center gap-2 transition-colors"
                  >
                     <UserIcon className="w-4 h-4" />
                     <span className="hidden sm:inline">Профиль</span>
                  </button>
               </div>
            </div>
         </header>

         {/* ОБНОВЛЕННЫЙ SUB-HEADER */}
         <div className="shrink-0 bg-white border-b border-[#E5E0D8] px-4 lg:px-8 py-3 shadow-xs z-30">
            <div className="max-w-7xl mx-auto flex flex-col gap-3">
               <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center justify-between w-full sm:w-auto gap-1 bg-[#F5F2ED] rounded-lg p-1 border border-[#E5E0D8]">
                     <button
                        onClick={prevWeek}
                        className="p-1.5 hover:bg-white rounded-md text-[#8B857D] transition-colors shadow-xs"
                     >
                        <ChevronLeft className="w-4 h-4" />
                     </button>
                     <span className="px-2 sm:px-4 text-[11px] sm:text-xs font-semibold text-[#3E3A35] whitespace-nowrap text-center flex-1">
                        {currentWeekLabel}
                     </span>
                     <button
                        onClick={nextWeek}
                        className="p-1.5 hover:bg-white rounded-md text-[#8B857D] transition-colors shadow-xs"
                     >
                        <ChevronRight className="w-4 h-4" />
                     </button>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                     {isAdmin && (
                        <button
                           onClick={openCreate}
                           className="px-3 sm:px-4 py-2 sm:py-1.5 text-[11px] sm:text-xs font-semibold bg-[#8BA888] hover:bg-[#7A9A77] text-white rounded-lg flex items-center gap-1.5 transition-colors"
                        >
                           <Plus className="w-3.5 h-3.5" />
                           <span className="hidden sm:inline">Добавить</span>
                        </button>
                     )}
                     <button
                        onClick={setToday}
                        className="px-3 sm:px-4 py-2 sm:py-1.5 text-[11px] sm:text-xs font-medium bg-[#F5F2ED] hover:bg-[#EDE8E0] text-[#5A534A] rounded-lg border border-[#E5E0D8] transition-colors"
                     >
                        Сегодня
                     </button>
                  </div>
               </div>

               <div className="flex sm:hidden w-full gap-1 justify-between mt-1">
                  {weekDates.map((day) => {
                     const isSelected =
                        day.dateObj.toDateString() ===
                        currentDate.toDateString()
                     return (
                        <button
                           key={day.key}
                           onClick={() => setCurrentDate(day.dateObj)}
                           className={`flex flex-col items-center justify-center flex-1 py-1.5 rounded-lg border transition-all ${
                              isSelected
                                 ? 'bg-[#8BA888] text-white border-[#8BA888] shadow-sm'
                                 : 'bg-transparent text-[#8B857D] border-transparent hover:bg-[#F5F2ED]'
                           }`}
                        >
                           <span
                              className={`text-[10px] font-medium mb-0.5 ${isSelected ? 'text-white/90' : 'text-[#B0A89E]'}`}
                           >
                              {day.short}
                           </span>
                           <span
                              className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-[#3E3A35]'}`}
                           >
                              {day.dateNumber}
                           </span>
                        </button>
                     )
                  })}
               </div>
            </div>
         </div>

         <main className="flex-1 min-h-0 max-w-7xl w-full mx-auto p-2 sm:p-4 lg:p-6 flex flex-col">
            {loading ? (
               <div className="flex-1 flex items-center justify-center text-[#8B857D] text-sm">
                  Загрузка...
               </div>
            ) : (
               <div className="flex-1 bg-white rounded-2xl border border-[#E5E0D8] shadow-sm flex flex-col overflow-hidden">
                  <div className="flex-1 overflow-auto w-full relative custom-scrollbar bg-white">
                     <div className="min-w-full relative">
                        <div className="grid grid-cols-[50px_1fr] sm:grid-cols-[60px_repeat(7,1fr)] sticky top-0 z-40 bg-[#FDFCFB]/95 backdrop-blur-md shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                           <div className="border-b border-r border-[#E5E0D8] sticky left-0 z-50 bg-[#FDFCFB]/95 backdrop-blur-md flex flex-col items-center justify-center py-2 sm:py-3 text-[10px] sm:text-[11px] font-semibold text-[#B0A89E] uppercase tracking-wider">
                              <Clock className="w-3.5 h-3.5 mb-0.5 opacity-60" />
                              Время
                           </div>
                           {weekDates.map((day) => {
                              const isSelected =
                                 day.dateObj.toDateString() ===
                                 currentDate.toDateString()
                              return (
                                 <div
                                    key={day.key}
                                    onClick={() => setCurrentDate(day.dateObj)}
                                    className={`py-2 sm:py-3 px-1 sm:px-2 border-b border-r border-[#E5E0D8] last:border-r-0 flex-col items-center justify-center cursor-pointer transition-colors ${
                                       isSelected ? 'flex' : 'hidden sm:flex'
                                    } ${day.isToday ? 'bg-[#E8F0E8]/60' : 'hover:bg-[#F5F2ED]/40'}`}
                                 >
                                    <span className="text-[11px] sm:text-xs font-medium text-[#8B857D]">
                                       {day.label}
                                    </span>
                                    <div
                                       className={`mt-1 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-bold ${
                                          day.isToday
                                             ? 'bg-[#8BA888] text-white shadow-sm shadow-[#8BA888]/30'
                                             : 'text-[#3E3A35] bg-white border border-[#E5E0D8]'
                                       }`}
                                    >
                                       {day.dateNumber}
                                    </div>
                                 </div>
                              )
                           })}
                        </div>

                        <div className="grid grid-cols-[50px_1fr] sm:grid-cols-[60px_repeat(7,1fr)] relative min-h-[1440px]">
                           <div className="bg-[#FDFCFB] flex flex-col text-right select-none sticky left-0 z-30 border-r border-[#E5E0D8]">
                              {timeSlots.map((time) => (
                                 <div
                                    key={time}
                                    className="h-24 border-b border-[#F0EDE8] text-[10px] sm:text-[11px] text-[#B0A89E] font-medium pt-1 sm:pt-2 pr-1 sm:pr-2 bg-[#FDFCFB]"
                                 >
                                    {time}
                                 </div>
                              ))}
                           </div>

                           {weekDates.map((day) => {
                              const isSelected =
                                 day.dateObj.toDateString() ===
                                 currentDate.toDateString()
                              const dayLessons = visibleLessons.filter((l) =>
                                 l.isRecurring
                                    ? l.dayOfWeek === day.key
                                    : new Date(l.startsAt)
                                         .toISOString()
                                         .split('T')[0] ===
                                      day.dateObj.toISOString().split('T')[0],
                              )

                              const getCurrentTimePosition = () => {
                                 const hours = currentTime.getHours()
                                 const minutes = currentTime.getMinutes()
                                 const startMinutesFrom8 =
                                    hours * 60 + minutes - 8 * 60
                                 return (startMinutesFrom8 / 60) * 96
                              }

                              return (
                                 <div
                                    key={day.key}
                                    className={`relative border-r border-[#F0EDE8] last:border-r-0 ${
                                       isSelected ? 'block' : 'hidden sm:block'
                                    } ${day.isToday ? 'bg-[#E8F0E8]/10' : 'bg-white'}`}
                                 >
                                    {timeSlots.map((time) => (
                                       <div
                                          key={time}
                                          className="h-24 border-b border-[#F0EDE8]/80 w-full"
                                       />
                                    ))}

                                    {day.isToday && (
                                       <div
                                          className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
                                          style={{
                                             top: `${getCurrentTimePosition()}px`,
                                          }}
                                       >
                                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#8BA888] -ml-[3px] sm:-ml-1 ring-4 ring-[#8BA888]/20" />
                                          <div className="flex-1 h-[2px] bg-[#8BA888]/70" />
                                       </div>
                                    )}

                                    {dayLessons.map((l) =>
                                       renderGridEvent(l, day.key),
                                    )}
                                 </div>
                              )
                           })}
                        </div>
                     </div>
                  </div>
               </div>
            )}
         </main>

         {/* Модалка просмотра */}
         {selectedEvent && !showLessonForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2C2824]/40 backdrop-blur-xs animate-in fade-in duration-200">
               <div className="bg-white rounded-2xl shadow-2xl border border-[#E5E0D8] w-full max-w-lg max-h-[90dvh] flex flex-col overflow-hidden">
                  <div className="p-4 sm:p-6 border-b bg-[#F5F2ED] border-[#E5E0D8] relative shrink-0">
                     <button
                        onClick={() => setSelectedEvent(null)}
                        className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white text-[#8B857D] transition-colors"
                     >
                        <X className="w-4 h-4" />
                     </button>
                     <div className="flex items-center gap-2 mb-2 pr-8 flex-wrap">
                        {selectedEvent.isRecurring && (
                           <span className="text-[10px] font-semibold px-2 py-1 rounded-md bg-white border border-[#E5E0D8] text-[#8BA888]">
                              ЕЖЕНЕДЕЛЬНО
                           </span>
                        )}
                        <span className="text-[11px] font-medium text-[#8B857D] bg-white px-2 py-1 rounded-md border border-[#E5E0D8]">
                           {new Date(selectedEvent.startsAt).toLocaleDateString(
                              'ru-RU',
                              {
                                 timeZone: 'UTC',
                                 day: 'numeric',
                                 month: 'long',
                              },
                           )}
                        </span>
                     </div>
                     <h2 className="text-lg sm:text-xl font-extrabold text-[#3E3A35] pr-8 leading-tight">
                        {selectedEvent.subject}
                     </h2>
                  </div>
                  <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto custom-scrollbar flex-1">
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="flex items-start gap-3 p-3 rounded-xl bg-[#FDFCFB] border border-[#F0EDE8]">
                           <div className="p-2 rounded-lg bg-white shadow-xs text-[#5A7A5A] shrink-0">
                              <Clock className="w-4 h-4" />
                           </div>
                           <div className="min-w-0">
                              <span className="block text-[10px] sm:text-[11px] font-medium text-[#B0A89E] uppercase">
                                 Время
                              </span>
                              <span className="text-[11px] sm:text-xs font-bold text-[#3E3A35] truncate block">
                                 {formatTime(selectedEvent.startsAt)} –{' '}
                                 {formatTime(selectedEvent.endsAt)}
                              </span>
                           </div>
                        </div>
                        {selectedEvent.room && (
                           <div className="flex items-start gap-3 p-3 rounded-xl bg-[#FDFCFB] border border-[#F0EDE8]">
                              <div className="p-2 rounded-lg bg-white shadow-xs text-[#5A7A5A] shrink-0">
                                 <MapPin className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                 <span className="block text-[10px] sm:text-[11px] font-medium text-[#B0A89E] uppercase">
                                    Аудитория
                                 </span>
                                 <span className="text-[11px] sm:text-xs font-bold text-[#3E3A35] truncate block">
                                    {selectedEvent.room}
                                 </span>
                              </div>
                           </div>
                        )}
                     </div>

                     {selectedEvent.teacher && (
                        <div className="flex items-start gap-3 p-3 rounded-xl bg-[#FDFCFB] border border-[#F0EDE8]">
                           <div className="p-2 rounded-lg bg-white shadow-xs text-[#5A7A5A] shrink-0">
                              <UserIcon className="w-4 h-4" />
                           </div>
                           <div className="min-w-0">
                              <span className="block text-[10px] sm:text-[11px] font-medium text-[#B0A89E] uppercase">
                                 Преподаватель
                              </span>
                              <span className="text-[11px] sm:text-xs font-bold text-[#3E3A35] truncate block">
                                 {selectedEvent.teacher.name}
                              </span>
                           </div>
                        </div>
                     )}

                     <div>
                        <h4 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#B0A89E] mb-2 flex items-center gap-1.5">
                           <MessageSquare className="w-3.5 h-3.5" /> Комментарий
                        </h4>
                        {canEditComment ? (
                           <div className="flex flex-col gap-2">
                              <textarea
                                 value={commentText}
                                 onChange={(e) =>
                                    setCommentText(e.target.value)
                                 }
                                 placeholder="Добавить комментарий..."
                                 className="w-full bg-[#FDFCFB] border border-[#F0EDE8] rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-[#8BA888]"
                                 rows={3}
                              />
                              <button
                                 onClick={submitComment}
                                 className="self-end px-5 py-2 text-xs font-semibold bg-[#F5F2ED] hover:bg-[#EDE8E0] text-[#3E3A35] border border-[#E5E0D8] transition-colors rounded-lg"
                              >
                                 Сохранить
                              </button>
                           </div>
                        ) : (
                           <p className="text-[11px] sm:text-sm text-[#5A534A] leading-relaxed bg-[#FDFCFB]/50 p-3 sm:p-4 rounded-xl border border-[#F0EDE8]">
                              {selectedEvent.comment || 'Нет комментариев'}
                           </p>
                        )}
                     </div>
                  </div>
                  <div className="p-4 sm:p-6 border-t border-[#F0EDE8] bg-[#FDFCFB] shrink-0 flex flex-wrap-reverse items-center justify-between gap-3">
                     {isAdmin ? (
                        <div className="flex gap-2 w-full sm:w-auto">
                           <button
                              onClick={() => deleteLesson(selectedEvent.id)}
                              className="flex-1 sm:flex-none flex justify-center p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
                           >
                              <Trash2 className="w-4 h-4" />
                           </button>
                           <button
                              onClick={() => {
                                 setShowLessonForm(true)
                              }}
                              className="flex-1 sm:flex-none flex justify-center p-2 rounded-lg bg-[#F5F2ED] hover:bg-[#EDE8E0] text-[#8B857D] transition-colors"
                           >
                              <Edit className="w-4 h-4" />
                           </button>
                        </div>
                     ) : (
                        <div />
                     )}
                     <button
                        onClick={() => setSelectedEvent(null)}
                        className="w-full sm:w-auto px-6 py-2.5 text-xs font-semibold bg-[#8BA888] hover:bg-[#7A9A77] text-white rounded-xl transition-colors"
                     >
                        Закрыть
                     </button>
                  </div>
               </div>
            </div>
         )}

         {/* Модалка формы создания */}
         {showLessonForm && isAdmin && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#2C2824]/40 backdrop-blur-xs">
               <div className="bg-white rounded-2xl shadow-2xl border border-[#E5E0D8] w-full max-w-md max-h-[90dvh] flex flex-col overflow-hidden">
                  <div className="p-4 sm:p-6 border-b border-[#E5E0D8] flex items-center justify-between shrink-0">
                     <h3 className="text-lg font-bold">
                        {selectedEvent ? 'Редактирование' : 'Новая группа'}
                     </h3>
                     <button
                        onClick={() => {
                           setShowLessonForm(false)
                           setSelectedEvent(null)
                        }}
                        className="p-1.5 rounded-lg hover:bg-[#F5F2ED] transition-colors"
                     >
                        <X className="w-4 h-4" />
                     </button>
                  </div>

                  <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1">
                     {!selectedEvent && (
                        <div className="flex gap-2 mb-5">
                           <button
                              type="button"
                              onClick={() => setMode('once')}
                              className={`flex-1 py-2 text-[11px] sm:text-xs font-semibold rounded-xl border transition-all ${mode === 'once' ? 'bg-[#8BA888] text-white border-[#8BA888] shadow-sm shadow-[#8BA888]/20' : 'bg-[#F5F2ED] text-[#5A534A] border-[#E5E0D8] hover:bg-[#EDE8E0]'}`}
                           >
                              Разовое
                           </button>
                           <button
                              type="button"
                              onClick={() => setMode('weekly')}
                              className={`flex-1 py-2 text-[11px] sm:text-xs font-semibold rounded-xl border transition-all ${mode === 'weekly' ? 'bg-[#8BA888] text-white border-[#8BA888] shadow-sm shadow-[#8BA888]/20' : 'bg-[#F5F2ED] text-[#5A534A] border-[#E5E0D8] hover:bg-[#EDE8E0]'}`}
                           >
                              Каждую неделю
                           </button>
                        </div>
                     )}

                     <form
                        id="lesson-form"
                        onSubmit={submitLesson}
                        className="space-y-3 sm:space-y-4"
                     >
                        <input
                           type="text"
                           placeholder="Группа"
                           value={form.subject}
                           onChange={(e) =>
                              setForm({ ...form, subject: e.target.value })
                           }
                           required
                           className="w-full bg-[#F5F2ED]/70 focus:bg-white border border-[#E5E0D8] focus:border-[#8BA888] focus:outline-none transition-colors rounded-xl px-4 py-2 sm:py-2.5 text-[11px] sm:text-sm"
                        />

                        {!selectedEvent && mode === 'once' && (
                           <input
                              type="date"
                              value={form.date}
                              onChange={(e) =>
                                 setForm({ ...form, date: e.target.value })
                              }
                              required
                              className="w-full bg-[#F5F2ED]/70 focus:bg-white border border-[#E5E0D8] focus:border-[#8BA888] focus:outline-none transition-colors rounded-xl px-4 py-2 sm:py-2.5 text-[11px] sm:text-sm"
                           />
                        )}

                        {!selectedEvent && mode === 'weekly' && (
                           <select
                              value={form.dayOfWeek}
                              onChange={(e) =>
                                 setForm({ ...form, dayOfWeek: e.target.value })
                              }
                              className="w-full bg-[#F5F2ED]/70 focus:bg-white border border-[#E5E0D8] focus:border-[#8BA888] focus:outline-none transition-colors rounded-xl px-4 py-2 sm:py-2.5 text-[11px] sm:text-sm appearance-none"
                           >
                              {DAY_OPTIONS.map((d) => (
                                 <option key={d.value} value={d.value}>
                                    {d.label}
                                 </option>
                              ))}
                           </select>
                        )}

                        {!selectedEvent && (
                           <div className="grid grid-cols-2 gap-3">
                              <div>
                                 <label className="text-[10px] font-medium text-[#8B857D] mb-1 block pl-1">
                                    Начало
                                 </label>
                                 <input
                                    type="time"
                                    value={form.startTime}
                                    onChange={(e) =>
                                       setForm({
                                          ...form,
                                          startTime: e.target.value,
                                       })
                                    }
                                    required
                                    className="w-full bg-[#F5F2ED]/70 focus:bg-white border border-[#E5E0D8] focus:border-[#8BA888] focus:outline-none transition-colors rounded-xl px-3 py-2 sm:py-2.5 text-[11px] sm:text-sm"
                                 />
                              </div>
                              <div>
                                 <label className="text-[10px] font-medium text-[#8B857D] mb-1 block pl-1">
                                    Конец
                                 </label>
                                 <input
                                    type="time"
                                    value={form.endTime}
                                    onChange={(e) =>
                                       setForm({
                                          ...form,
                                          endTime: e.target.value,
                                       })
                                    }
                                    required
                                    className="w-full bg-[#F5F2ED]/70 focus:bg-white border border-[#E5E0D8] focus:border-[#8BA888] focus:outline-none transition-colors rounded-xl px-3 py-2 sm:py-2.5 text-[11px] sm:text-sm"
                                 />
                              </div>
                           </div>
                        )}

                        <textarea
                           placeholder="Комментарий (необязательно)"
                           value={form.comment}
                           onChange={(e) =>
                              setForm({ ...form, comment: e.target.value })
                           }
                           rows={2}
                           className="w-full bg-[#F5F2ED]/70 focus:bg-white border border-[#E5E0D8] focus:border-[#8BA888] focus:outline-none transition-colors rounded-xl px-4 py-2.5 sm:py-3 text-[11px] sm:text-sm resize-none"
                        />

                        {error && (
                           <div className="p-3 rounded-xl bg-red-50 text-[11px] text-red-700 font-medium border border-red-100">
                              {error}
                           </div>
                        )}
                     </form>
                  </div>

                  <div className="p-4 sm:p-6 border-t border-[#F0EDE8] bg-[#FDFCFB] shrink-0 flex gap-3">
                     <button
                        type="button"
                        onClick={() => {
                           setShowLessonForm(false)
                           setSelectedEvent(null)
                        }}
                        className="flex-1 py-2.5 sm:py-3 text-[11px] sm:text-xs font-semibold bg-[#F5F2ED] hover:bg-[#EDE8E0] text-[#3E3A35] transition-colors rounded-xl"
                     >
                        Отмена
                     </button>
                     <button
                        form="lesson-form"
                        type="submit"
                        className="flex-1 py-2.5 sm:py-3 text-[11px] sm:text-xs font-semibold bg-[#8BA888] hover:bg-[#7A9A77] text-white shadow-sm shadow-[#8BA888]/20 transition-all rounded-xl"
                     >
                        Сохранить
                     </button>
                  </div>
               </div>
            </div>
         )}

         <style jsx global>{`
            .custom-scrollbar::-webkit-scrollbar {
               width: 6px;
               height: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
               background: transparent;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
               background-color: #d6d2cc;
               border-radius: 10px;
            }
            .custom-scrollbar:hover::-webkit-scrollbar-thumb {
               background-color: #b0a89e;
            }
         `}</style>
      </div>
   )
}
