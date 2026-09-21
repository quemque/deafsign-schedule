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

export function updateDayTeacher(
   form: FormDataState,
   dayKey: string,
   value: string,
): FormDataState {
   return {
      ...form,
      teacherByDay: {
         ...(form.teacherByDay || {}),
         [dayKey]: value,
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
