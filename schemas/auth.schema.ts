import { z } from 'zod'

export const loginSchema = z.object({
   login: z.string().trim().min(1, 'Введите логин или email'),
   password: z.string().min(1, 'Введите пароль'),
})

export type LoginInput = z.infer<typeof loginSchema>
