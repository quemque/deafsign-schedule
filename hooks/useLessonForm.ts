import { useState } from 'react'
import type { ApiLesson, FormDataState } from '@/types/schedule'
import { INITIAL_FORM } from '@/constants/schedule'
import { scheduleApi } from '@/services/scheduleApi'

export function useLessonForm(onSuccess?: () => void) {
   const [isOpen, setIsOpen] = useState(false)
   const [selectedLesson, setSelectedLesson] = useState<ApiLesson | null>(null)
   const [editingDate, setEditingDate] = useState<Date | null>(null)
   const [initialTeacherName, setInitialTeacherName] = useState('')
   const [mode, setMode] = useState<'once' | 'weekly'>('once')
   const [form, setForm] = useState<FormDataState>(INITIAL_FORM)
   const [error, setError] = useState('')

   const openCreate = (currentDate: Date) => {
      setSelectedLesson(null)
      setEditingDate(null)
      setInitialTeacherName('')
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

   const openEdit = (lesson: ApiLesson, activeDate?: Date) => {
      setSelectedLesson(lesson)
      const targetDate = activeDate || new Date(lesson.startsAt)
      setEditingDate(targetDate)

      const yyyy = targetDate.getFullYear()
      const mm = String(targetDate.getMonth() + 1).padStart(2, '0')
      const dd = String(targetDate.getDate()).padStart(2, '0')
      const dateKey = `${yyyy}-${mm}-${dd}`

      const dateOverride = lesson.overrides?.find((o) => {
         const oDateStr =
            typeof o.date === 'string' ? o.date : new Date(o.date).toISOString()
         return oDateStr.startsWith(dateKey)
      })

      const currentTeacher =
         dateOverride !== undefined
            ? dateOverride.customTeacherName || ''
            : lesson.customTeacherName || lesson.teacher?.name || ''

      setInitialTeacherName(currentTeacher)

      const formatTime = (iso: string) =>
         new Date(iso).toLocaleTimeString('ru-RU', {
            timeZone: 'UTC',
            hour: '2-digit',
            minute: '2-digit',
         })

      setForm({
         subject: lesson.subject,
         comment: '',
         date: dateKey,
         dayOfWeek: lesson.dayOfWeek || 'MONDAY',
         startTime: formatTime(lesson.startsAt),
         endTime: formatTime(lesson.endsAt),
         room: '',
         teacherId: lesson.teacher?.id || lesson.teacherId || '',
         customTeacherName: currentTeacher,
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
      setEditingDate(null)
      setInitialTeacherName('')
      setError('')
   }

   const submitForm = async (
      e: React.FormEvent,
      teacherScope: 'this' | 'all' = 'all',
   ) => {
      e.preventDefault()
      setError('')

      let activeDateStr: string | undefined
      if (editingDate) {
         const y = editingDate.getFullYear()
         const m = String(editingDate.getMonth() + 1).padStart(2, '0')
         const d = String(editingDate.getDate()).padStart(2, '0')
         activeDateStr = `${y}-${m}-${d}`
      }

      const payload = selectedLesson
         ? {
              subject: form.subject,
              teacherId: form.teacherId || null,
              customTeacherName: form.customTeacherName || null,
              color: form.color,
              totalLessons: form.totalLessons
                 ? Number(form.totalLessons)
                 : null,
              teacherScope,
              activeDate: activeDateStr,
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
      initialTeacherName,
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
