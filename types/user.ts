export type UserRole = 'ADMIN' | 'TEACHER' | 'USER' | string

export interface UserProfile {
   id: string
   name: string
   login: string
   email: string
   role: UserRole
}
