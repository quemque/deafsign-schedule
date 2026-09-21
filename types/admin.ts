export type UserRole = 'ADMIN' | 'TEACHER' | 'USER'

export interface AdminUser {
   id: string
   email: string
   login: string
   name: string
   role: UserRole | string
   isActive: boolean
   createdAt: string
   lastLoginAt: string | null
}

export interface UserFormData {
   email: string
   login: string
   password?: string
   name: string
   role: string
   isActive: boolean
}
