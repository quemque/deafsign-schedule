import { z } from 'zod'
import { Role } from '@prisma/client'

export const createUserSchema = z.object({
   email: z.string().trim().email('Некорректный email-адрес'),
   login: z
      .string()
      .trim()
      .min(3, 'Логин должен быть не короче 3 символов')
      .max(50, 'Логин не должен превышать 50 символов'),
   password: z.string().min(6, 'Пароль должен быть не короче 6 символов'),
   name: z.string().trim().min(1, 'Укажите ФИО пользователя'),
   role: z.nativeEnum(Role).default(Role.USER),
})

export const updateUserSchema = z.object({
   name: z.string().trim().min(1).optional(),
   login: z.string().trim().min(3).max(50).optional(),
   email: z.string().trim().email().optional(),
   role: z.nativeEnum(Role).optional(),
   isActive: z.boolean().optional(),
   password: z.string().min(6).optional(),
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
