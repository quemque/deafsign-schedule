'use client'

import { create } from 'zustand'

interface ScheduleState {
   currentDate: Date
   mobileViewMode: 'day' | 'week'
   setCurrentDate: (date: Date) => void
   setMobileViewMode: (mode: 'day' | 'week') => void
   prevWeek: () => void
   nextWeek: () => void
   prevDay: () => void
   nextDay: () => void
   setToday: () => void
}

export const useScheduleStore = create<ScheduleState>((set) => ({
   currentDate: new Date(),
   mobileViewMode: 'day',

   setCurrentDate: (date: Date) => set({ currentDate: date }),

   setMobileViewMode: (mode: 'day' | 'week') => set({ mobileViewMode: mode }),

   prevWeek: () =>
      set((state) => {
         const next = new Date(state.currentDate)
         next.setDate(next.getDate() - 7)
         return { currentDate: next }
      }),

   nextWeek: () =>
      set((state) => {
         const next = new Date(state.currentDate)
         next.setDate(next.getDate() + 7)
         return { currentDate: next }
      }),

   prevDay: () =>
      set((state) => {
         const next = new Date(state.currentDate)
         next.setDate(next.getDate() - 1)
         return { currentDate: next }
      }),

   nextDay: () =>
      set((state) => {
         const next = new Date(state.currentDate)
         next.setDate(next.getDate() + 1)
         return { currentDate: next }
      }),

   setToday: () => set({ currentDate: new Date() }),
}))
