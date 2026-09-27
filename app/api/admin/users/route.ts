import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { withAuth, parseJsonBody } from '@/lib/apiGuard'
import { createUserSchema } from '@/schemas/user.schema'

export const GET = withAuth(['ADMIN'], async () => {
   const users = await prisma.user.findMany({
      select: {
         id: true,
         email: true,
         login: true,
         name: true,
         role: true,
         isActive: true,
         createdAt: true,
         lastLoginAt: true,
      },
      orderBy: { createdAt: 'desc' },
   })

   return NextResponse.json({ users })
})

export const POST = withAuth(['ADMIN'], async (req, { user: adminUser }) => {
   const parsed = await parseJsonBody(req, createUserSchema)
   if ('errorResponse' in parsed) {
      return parsed.errorResponse
   }

   const { email, login, password, name, role } = parsed.data

   try {
      const existing = await prisma.user.findFirst({
         where: { OR: [{ email }, { login }] },
      })

      if (existing) {
         return NextResponse.json(
            { error: 'Пользователь с таким логином или email уже существует' },
            { status: 409 },
         )
      }

      const passwordHash = await hashPassword(password)

      const newUser = await prisma.user.create({
         data: {
            email,
            login,
            passwordHash,
            name,
            role,
         },
         select: {
            id: true,
            email: true,
            login: true,
            name: true,
            role: true,
         },
      })

      await prisma.auditLog.create({
         data: {
            action: 'create',
            entity: 'user',
            entityId: newUser.id,
            userId: adminUser.id,
            metadata: { role: newUser.role },
         },
      })

      return NextResponse.json({ user: newUser }, { status: 201 })
   } catch (error) {
      console.error(error)
      return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
   }
})
