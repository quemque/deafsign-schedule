import { INDEX_TO_DAY } from '@/constants/schedule'
import type { FormDataState } from '@/types/schedule'

export function computeDayFromDate(dateStr: string): string {
   const [year, month, day] = dateStr.split('-').map(Number)
   const selectedDate = new Date(year, month - 1, day)
   return INDEX_TO_DAY[selectedDate.getDay()]
}

export function updateFormDate(
   form: FormDataState,
   newDateStr: string,
): FormDataState {
   if (!newDateStr) {
      return { ...form, date: newDateStr }
   }

   const computedDay = computeDayFromDate(newDateStr)
   const currentDays = form.daysOfWeek || []
   const nextDays = currentDays.includes(computedDay)
      ? currentDays
      : [...currentDays, computedDay]

   return {
      ...form,
      date: newDateStr,
      dayOfWeek: computedDay,
      daysOfWeek: nextDays.length > 0 ? nextDays : [computedDay],
   }
}

export function toggleFormDayOfWeek(
   form: FormDataState,
   dayKey: string,
): FormDataState {
   const currentDays = form.daysOfWeek || []
   if (currentDays.includes(dayKey) && currentDays.length === 1) {
      return form
   }

   const updatedTeacherByDay = { ...(form.teacherByDay || {}) }
   const updatedTimeByDay = { ...(form.timeByDay || {}) }

   let nextDays: string[]

   if (currentDays.includes(dayKey)) {
      nextDays = currentDays.filter((d) => d !== dayKey)
      delete updatedTeacherByDay[dayKey]
      delete updatedTimeByDay[dayKey]
   } else {
      nextDays = [...currentDays, dayKey]
   }

   return {
      ...form,
      daysOfWeek: nextDays,
      dayOfWeek: nextDays[0] || dayKey,
      teacherByDay: updatedTeacherByDay,
      timeByDay: updatedTimeByDay,
   }
}

export function getMainTeachersList(customTeacherName: string): string[] {
   if (!customTeacherName) return ['']

   const parts = customTeacherName.split(',')
   return parts.map((part, index) =>
      index > 0 && part.startsWith(' ') ? part.slice(1) : part,
   )
}

export function updateMainTeacher(
   form: FormDataState,
   index: number,
   value: string,
): FormDataState {
   const sanitizedValue = value.replace(/,/g, '')
   const teachers = [...getMainTeachersList(form.customTeacherName)]
   teachers[index] = sanitizedValue

   return {
      ...form,
      customTeacherName: teachers.join(', '),
   }
}

export function addMainTeacher(form: FormDataState): FormDataState {
   const teachers = [...getMainTeachersList(form.customTeacherName), '']
   return {
      ...form,
      customTeacherName: teachers.join(', '),
   }
}

export function removeMainTeacher(
   form: FormDataState,
   index: number,
): FormDataState {
   const current = getMainTeachersList(form.customTeacherName)
   const next = current.filter((_, i) => i !== index)
   return {
      ...form,
      customTeacherName: next.length > 0 ? next.join(', ') : '',
   }
}

export function getDayTeachersList(
   teacherByDay: Record<string, string[] | string> | undefined,
   dayKey: string,
): string[] {
   const value = teacherByDay?.[dayKey]
   if (Array.isArray(value)) {
      return value.length > 0 ? value : ['']
   }
   if (typeof value === 'string' && value.trim()) {
      return [value]
   }
   return ['']
}

export function addDayTeacher(
   form: FormDataState,
   dayKey: string,
): FormDataState {
   const current = getDayTeachersList(form.teacherByDay, dayKey)
   return {
      ...form,
      teacherByDay: {
         ...(form.teacherByDay || {}),
         [dayKey]: [...current, ''],
      },
   }
}

export function updateDayTeacher(
   form: FormDataState,
   dayKey: string,
   index: number,
   value: string,
): FormDataState {
   const current = [...getDayTeachersList(form.teacherByDay, dayKey)]
   current[index] = value
   return {
      ...form,
      teacherByDay: {
         ...(form.teacherByDay || {}),
         [dayKey]: current,
      },
   }
}

export function removeDayTeacher(
   form: FormDataState,
   dayKey: string,
   index: number,
): FormDataState {
   const current = getDayTeachersList(form.teacherByDay, dayKey)
   const next = current.filter((_, i) => i !== index)
   return {
      ...form,
      teacherByDay: {
         ...(form.teacherByDay || {}),
         [dayKey]: next.length > 0 ? next : [''],
      },
   }
}

export function updateDayTime(
   form: FormDataState,
   dayKey: string,
   field: 'startTime' | 'endTime',
   value: string,
): FormDataState {
   const currentSlot = form.timeByDay?.[dayKey] || {
      startTime: form.startTime,
      endTime: form.endTime,
   }

   return {
      ...form,
      timeByDay: {
         ...(form.timeByDay || {}),
         [dayKey]: {
            ...currentSlot,
            [field]: value,
         },
      },
   }
}
