'use client'

import { create } from 'zustand'
import type { ApiLesson } from '@/types/schedule'

interface DetailsModalState {
   isOpen: boolean
   lesson: ApiLesson | null
   date: Date | null
}

interface FormModalState {
   isOpen: boolean
   isEdit: boolean
   lesson: ApiLesson | null
   activeDate: Date | null
}

interface DeleteConfirmModalState {
   isOpen: boolean
   lesson: ApiLesson | null
   date: Date | null
}

interface RescheduleModalState {
   isOpen: boolean
   lessonId: string | null
   dateKey: string
   initialStartTime: string
   initialEndTime: string
}

interface ModalStoreState {
   detailsModal: DetailsModalState
   formModal: FormModalState
   deleteConfirmModal: DeleteConfirmModalState
   rescheduleModal: RescheduleModalState

   openDetails: (lesson: ApiLesson, date: Date) => void
   closeDetails: () => void

   openCreateForm: (date?: Date) => void
   openEditForm: (lesson: ApiLesson, date?: Date) => void
   closeForm: () => void

   openDeleteConfirm: (lesson: ApiLesson, date: Date) => void
   closeDeleteConfirm: () => void

   openReschedule: (
      lessonId: string,
      dateKey: string,
      initialStartTime: string,
      initialEndTime: string,
   ) => void
   closeReschedule: () => void

   closeAllModals: () => void
   isAnyModalOpen: () => boolean
}

const initialDetailsModal: DetailsModalState = {
   isOpen: false,
   lesson: null,
   date: null,
}

const initialFormModal: FormModalState = {
   isOpen: false,
   isEdit: false,
   lesson: null,
   activeDate: null,
}

const initialDeleteConfirmModal: DeleteConfirmModalState = {
   isOpen: false,
   lesson: null,
   date: null,
}

const initialRescheduleModal: RescheduleModalState = {
   isOpen: false,
   lessonId: null,
   dateKey: '',
   initialStartTime: '',
   initialEndTime: '',
}

export const useModalStore = create<ModalStoreState>((set, get) => ({
   detailsModal: initialDetailsModal,
   formModal: initialFormModal,
   deleteConfirmModal: initialDeleteConfirmModal,
   rescheduleModal: initialRescheduleModal,

   openDetails: (lesson, date) =>
      set({
         detailsModal: { isOpen: true, lesson, date },
      }),

   closeDetails: () =>
      set({
         detailsModal: initialDetailsModal,
      }),

   openCreateForm: (date) =>
      set({
         formModal: {
            isOpen: true,
            isEdit: false,
            lesson: null,
            activeDate: date || new Date(),
         },
      }),

   openEditForm: (lesson, date) =>
      set({
         formModal: {
            isOpen: true,
            isEdit: true,
            lesson,
            activeDate: date || new Date(lesson.startsAt),
         },
      }),

   closeForm: () =>
      set({
         formModal: initialFormModal,
      }),

   openDeleteConfirm: (lesson, date) =>
      set({
         deleteConfirmModal: { isOpen: true, lesson, date },
      }),

   closeDeleteConfirm: () =>
      set({
         deleteConfirmModal: initialDeleteConfirmModal,
      }),

   openReschedule: (lessonId, dateKey, initialStartTime, initialEndTime) =>
      set({
         rescheduleModal: {
            isOpen: true,
            lessonId,
            dateKey,
            initialStartTime,
            initialEndTime,
         },
      }),

   closeReschedule: () =>
      set({
         rescheduleModal: initialRescheduleModal,
      }),

   closeAllModals: () =>
      set({
         detailsModal: initialDetailsModal,
         formModal: initialFormModal,
         deleteConfirmModal: initialDeleteConfirmModal,
         rescheduleModal: initialRescheduleModal,
      }),

   isAnyModalOpen: () => {
      const state = get()
      return (
         state.detailsModal.isOpen ||
         state.formModal.isOpen ||
         state.deleteConfirmModal.isOpen ||
         state.rescheduleModal.isOpen
      )
   },
}))
