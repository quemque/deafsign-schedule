'use client'

import { useState, useEffect } from 'react'
import type { FormDataState } from '@/types/schedule'
import { INITIAL_FORM, INDEX_TO_DAY } from '@/constants/schedule'
import { useModalStore } from '@/stores/useModalStore'
import { useScheduleMutations } from '@/hooks/useScheduleMutations'

export function useLessonForm() {
   const formModal = useModalStore((state) => state.formModal)
   const closeForm = useModalStore((state) => state.closeForm)
   const { createLesson, updateLesson } = useScheduleMutations()

   const [mode, setMode] = useState<'once' | 'weekly'>('once')
   const [form, setForm] = useState<FormDataState>(INITIAL_FORM)
   const [initialTeacherName, setInitialTeacherName] = useState('')
   const [error, setError] = useState('')

   useEffect(() => {
      if (!formModal.isOpen) return

      if (formModal.isEdit && formModal.lesson) {
         const lesson = formModal.lesson
         const targetDate = formModal.activeDate || new Date(lesson.startsAt)

         const yyyy = targetDate.getFullYear()
         const mm = String(targetDate.getMonth() + 1).padStart(2, '0')
         const dd = String(targetDate.getDate()).padStart(2, '0')
         const dateKey = `${yyyy}-${mm}-${dd}`

         const teacherName =
            lesson.customTeacherName ?? lesson.teacher?.name ?? ''
         setInitialTeacherName(teacherName)

         const formatTime = (iso: string | Date) =>
            new Date(iso).toLocaleTimeString('ru-RU', {
               timeZone: 'UTC',
               hour: '2-digit',
               minute: '2-digit',
            })

         const loadedDays =
            lesson.daysOfWeek && lesson.daysOfWeek.length > 0
               ? lesson.daysOfWeek
               : lesson.dayOfWeek
                 ? [lesson.dayOfWeek]
                 : ['MONDAY']

         setForm({
            subject: lesson.subject,
            date: dateKey,
            dayOfWeek: loadedDays[0] || 'MONDAY',
            daysOfWeek: loadedDays,
            startTime: formatTime(lesson.startsAt),
            endTime: formatTime(lesson.endsAt),
            customTeacherName: teacherName,
            teacherByDay:
               (lesson.teacherByDay as Record<string, string[] | string>) || {},
            timeByDay: lesson.timeByDay || {},
            color: lesson.color || '#8BA888',
            totalLessons: lesson.totalLessons
               ? String(lesson.totalLessons)
               : '',
         })
         setMode(lesson.isRecurring ? 'weekly' : 'once')
         setError('')
      } else {
         const referenceDate = formModal.activeDate || new Date()
         const yyyy = referenceDate.getFullYear()
         const mm = String(referenceDate.getMonth() + 1).padStart(2, '0')
         const dd = String(referenceDate.getDate()).padStart(2, '0')
         const currentDayKey = INDEX_TO_DAY[referenceDate.getDay()]

         setForm({
            ...INITIAL_FORM,
            date: `${yyyy}-${mm}-${dd}`,
            dayOfWeek: currentDayKey,
            daysOfWeek: [currentDayKey],
            teacherByDay: {},
            timeByDay: {},
         })
         setInitialTeacherName('')
         setMode('once')
         setError('')
      }
   }, [formModal])

   const submitForm = async (
      e: React.FormEvent,
      teacherScope: 'this' | 'all' = 'all',
   ) => {
      e.preventDefault()
      setError('')

      let activeDateStr: string | undefined
      if (formModal.activeDate) {
         const y = formModal.activeDate.getFullYear()
         const m = String(formModal.activeDate.getMonth() + 1).padStart(2, '0')
         const d = String(formModal.activeDate.getDate()).padStart(2, '0')
         activeDateStr = `${y}-${m}-${d}`
      }

      try {
         if (formModal.isEdit && formModal.lesson) {
            const payload = {
               subject: form.subject,
               teacherId:
                  formModal.lesson.teacherId ||
                  formModal.lesson.teacher?.id ||
                  null,
               customTeacherName: form.customTeacherName || null,
               teacherByDay: form.teacherByDay,
               timeByDay: form.timeByDay,
               color: form.color,
               daysOfWeek: form.daysOfWeek,
               totalLessons: form.totalLessons
                  ? Number(form.totalLessons)
                  : null,
               teacherScope,
               activeDate: activeDateStr,
            }
            await updateLesson({ id: formModal.lesson.id, payload })
         } else {
            const payload = {
               ...form,
               totalLessons: form.totalLessons
                  ? Number(form.totalLessons)
                  : null,
               isRecurring: mode === 'weekly',
            }
            await createLesson(payload)
         }
         closeForm()
      } catch (err) {
         setError(
            err instanceof Error ? err.message : 'Не удалось сохранить занятие',
         )
      }
   }

   return {
      isOpen: formModal.isOpen,
      isEdit: formModal.isEdit,
      mode,
      setMode,
      form,
      setForm,
      initialTeacherName,
      error,
      closeForm,
      submitForm,
   }
}
