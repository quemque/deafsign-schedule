'use client'

import { Plus } from 'lucide-react'
import { useAdminUsers } from '@/hooks/useAdminUsers'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { UsersTable } from '@/components/admin/UsersTable'
import { UsersMobileList } from '@/components/admin/UsersMobileList'
import { UserFormModal } from '@/components/admin/UserFormModal'
import { LoadingState } from '@/components/ui/LoadingState'

export default function AdminPage() {
   const {
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
   } = useAdminUsers()

   return (
      <div className="min-h-screen bg-[#FAF8F5] text-[#3E3A35] font-sans flex flex-col">
         <AdminHeader />

         <main className="max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between gap-2 mb-4 sm:mb-6">
               <h2 className="text-base sm:text-lg font-bold">
                  Пользователи{' '}
                  <span className="text-[#8B857D] text-xs sm:text-sm font-medium">
                     ({users.length})
                  </span>
               </h2>

               <button
                  type="button"
                  onClick={openCreateModal}
                  className="px-3 py-2 sm:px-4 sm:py-2 text-xs font-semibold bg-[#8BA888] hover:bg-[#7A9A77] text-white rounded-xl flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
               >
                  <Plus className="w-4 h-4" />
                  <span>Создать</span>
               </button>
            </div>

            {loading ? (
               <LoadingState variant="full" />
            ) : (
               <>
                  <UsersMobileList
                     users={users}
                     onEdit={openEditModal}
                     onToggleActive={toggleUserStatus}
                  />

                  <UsersTable
                     users={users}
                     onEdit={openEditModal}
                     onToggleActive={toggleUserStatus}
                  />
               </>
            )}
         </main>

         <UserFormModal
            isOpen={isModalOpen}
            editingUser={editingUser}
            error={error}
            onClose={closeModal}
            onSubmit={saveUser}
         />
      </div>
   )
}
