export type UserRole = 'ADMIN' | 'TEACHER' | 'USER'

export interface AdminUser {
   id: string
   email: string
   login: string
   name: string
   role: 'ADMIN' | 'TEACHER' | 'USER'
   groups?: string[]
   isActive: boolean
}

export interface UserFormData {
   email: string
   login: string
   password?: string
   name: string
   role: 'ADMIN' | 'TEACHER' | 'USER'
   groups: string[]
   isActive: boolean
}
