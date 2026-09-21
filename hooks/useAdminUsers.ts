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
         const res = await fetch('/api/admin/users')
         if (res.ok) {
            const data = await res.json()
            setUsers(data.users)
         }
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
      setIsModalOpen(false)
      setEditingUser(null)
      setError('')
   }

   const saveUser = async (formData: UserFormData) => {
      setError('')
      const url = editingUser
         ? `/api/admin/users/${editingUser.id}`
         : '/api/admin/users'
      const method = editingUser ? 'PATCH' : 'POST'

      const payload = editingUser
         ? {
              name: formData.name,
              login: formData.login,
              email: formData.email,
              role: formData.role,
              isActive: formData.isActive,
              ...(formData.password ? { password: formData.password } : {}),
           }
         : formData

      const res = await fetch(url, {
         method,
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(payload),
      })

      if (!res.ok) {
         const data = await res.json().catch(() => null)
         setError(data?.error || 'Ошибка при сохранении')
         return false
      }

      await fetchUsers()
      closeModal()
      return true
   }

   const toggleUserStatus = async (user: AdminUser) => {
      const nextStatus = !user.isActive
      const actionText = nextStatus ? 'активировать' : 'деактивировать'

      if (
         !confirm(
            `Вы действительно хотите ${actionText} пользователя ${user.name}?`,
         )
      ) {
         return
      }

      const res = await fetch(`/api/admin/users/${user.id}`, {
         method: 'PATCH',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ isActive: nextStatus }),
      })

      if (res.ok) {
         fetchUsers()
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
