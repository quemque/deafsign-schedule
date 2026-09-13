import { useState } from 'react'
import type { ApiLesson, FormDataState } from '@/types/schedule'
import { INITIAL_FORM } from '@/constants/schedule'
import { scheduleApi } from '@/services/scheduleApi'

export function useLessonForm(onSuccess?: () => void) {
   const [isOpen, setIsOpen] = useState(false)
   const [selectedLesson, setSelectedLesson] = useState<ApiLesson | null>(null)
   const [mode, setMode] = useState<'once' | 'weekly'>('once')
   const [form, setForm] = useState<FormDataState>(INITIAL_FORM)
   const [error, setError] = useState('')

   const openCreate = (currentDate: Date) => {
      setSelectedLesson(null)
      setMode('once')
      const yyyy = currentDate.getFullYear()
      const mm = String(currentDate.getMonth() + 1).padStart(2, '0')
      const dd = String(currentDate.getDate()).padStart(2, '0')

      const dayKeys = [
         'SUNDAY',
         'MONDAY',
         'TUESDAY',
         'WEDNESDAY',
         'THURSDAY',
         'FRIDAY',
         'SATURDAY',
      ]
      const currentDayKey = dayKeys[currentDate.getDay()]

      setForm({
         ...INITIAL_FORM,
         date: `${yyyy}-${mm}-${dd}`,
         dayOfWeek: currentDayKey,
      })
      setError('')
      setIsOpen(true)
   }

   const openEdit = (lesson: ApiLesson) => {
      setSelectedLesson(lesson)
      const d = new Date(lesson.startsAt)
      const yyyy = d.getUTCFullYear()
      const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
      const dd = String(d.getUTCDate()).padStart(2, '0')

      const formatTime = (iso: string) =>
         new Date(iso).toLocaleTimeString('ru-RU', {
            timeZone: 'UTC',
            hour: '2-digit',
            minute: '2-digit',
         })

      setForm({
         subject: lesson.subject,
         comment: '',
         date: `${yyyy}-${mm}-${dd}`,
         dayOfWeek: lesson.dayOfWeek || 'MONDAY',
         startTime: formatTime(lesson.startsAt),
         endTime: formatTime(lesson.endsAt),
         room: '',
         teacherId: lesson.teacher?.id || lesson.teacherId || '',
         customTeacherName: lesson.customTeacherName || '',
         color: lesson.color || '#8BA888',
         totalLessons: lesson.totalLessons ? String(lesson.totalLessons) : '',
      })
      setMode(lesson.isRecurring ? 'weekly' : 'once')
      setError('')
      setIsOpen(true)
   }

   const closeForm = () => {
      setIsOpen(false)
      setSelectedLesson(null)
      setError('')
   }

   const submitForm = async (e: React.FormEvent) => {
      e.preventDefault()
      setError('')

      const payload = selectedLesson
         ? {
              subject: form.subject,
              teacherId: form.teacherId || null,
              customTeacherName: form.customTeacherName || null,
              color: form.color,
              totalLessons: form.totalLessons
                 ? Number(form.totalLessons)
                 : null,
           }
         : {
              ...form,
              totalLessons: form.totalLessons
                 ? Number(form.totalLessons)
                 : null,
              isRecurring: mode === 'weekly',
           }

      try {
         if (selectedLesson) {
            await scheduleApi.updateLesson(selectedLesson.id, payload)
         } else {
            await scheduleApi.createLesson(payload)
         }
         closeForm()
         onSuccess?.()
      } catch (err) {
         setError(
            err instanceof Error ? err.message : 'Не удалось сохранить занятие',
         )
      }
   }

   return {
      isOpen,
      selectedLesson,
      mode,
      setMode,
      form,
      setForm,
      error,
      openCreate,
      openEdit,
      closeForm,
      submitForm,
   }
}
