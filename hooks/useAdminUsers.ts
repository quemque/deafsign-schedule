'use client'

import { useState, useEffect, useCallback } from 'react'
import type { AdminUser, UserFormData } from '@/types/admin'

export function useAdminUsers() {
   const [users, setUsers] = useState<AdminUser[]>([])
   const [loading, setLoading] = useState(true)
   const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
   const [isModalOpen, setIsModalOpen] = useState(false)
   const [error, setError] = useState('')

   const fetchUsers = useCallback(async () => {
      try {
         setLoading(true)
         const res = await fetch('/api/admin/users')
         if (!res.ok) throw new Error('Не удалось загрузить пользователей')
         const data = await res.json()
         setUsers(data.users || [])
      } catch (err) {
         setError(err instanceof Error ? err.message : 'Ошибка загрузки')
      } finally {
         setLoading(false)
      }
   }, [])

   useEffect(() => {
      fetchUsers()
   }, [fetchUsers])

   const openCreateModal = () => {
      setEditingUser(null)
      setError('')
      setIsModalOpen(true)
   }

   const openEditModal = (user: AdminUser) => {
      setEditingUser(user)
      setError('')
      setIsModalOpen(true)
   }

   const closeModal = () => {
      setEditingUser(null)
      setError('')
      setIsModalOpen(false)
   }

   const saveUser = async (formData: UserFormData): Promise<boolean> => {
      try {
         setError('')
         const isEditing = Boolean(editingUser)
         const url = isEditing
            ? `/api/admin/users/${editingUser!.id}`
            : '/api/admin/users'
         const method = isEditing ? 'PATCH' : 'POST'

         const payload: Record<string, unknown> = {
            name: formData.name,
            login: formData.login,
            email: formData.email,
            role: formData.role,
            isActive: formData.isActive,
            groups: formData.groups || [],
         }

         if (formData.password) {
            payload.password = formData.password
         }

         const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
         })

         const data = await res.json()
         if (!res.ok) {
            throw new Error(data.error || 'Ошибка при сохранении')
         }

         await fetchUsers()
         closeModal()
         return true
      } catch (err) {
         setError(err instanceof Error ? err.message : 'Ошибка сохранения')
         return false
      }
   }

   const toggleUserStatus = async (user: AdminUser) => {
      try {
         const res = await fetch(`/api/admin/users/${user.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isActive: !user.isActive }),
         })
         if (!res.ok) throw new Error('Не удалось изменить статус')
         await fetchUsers()
      } catch (err) {
         setError(err instanceof Error ? err.message : 'Ошибка')
      }
   }

   return {
      users,
      loading,
      editingUser,
      isModalOpen,
      error,
      openCreateModal,
      openEditModal,
      closeModal,
      saveUser,
      toggleUserStatus,
   }
}
