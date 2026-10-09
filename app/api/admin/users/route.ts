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
         groups: true,
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

   const { email, login, password, name, role, groups = [] } = parsed.data

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

      const newUser = await prisma.$transaction(async (tx) => {
         const user = await tx.user.create({
            data: {
               email,
               login,
               passwordHash,
               name,
               role,
               groups,
            },
            select: {
               id: true,
               email: true,
               login: true,
               name: true,
               role: true,
               groups: true,
               isActive: true,
            },
         })

         await tx.auditLog.create({
            data: {
               action: 'create',
               entity: 'user',
               entityId: user.id,
               userId: adminUser.id,
               metadata: { role: user.role, groupsCount: user.groups.length },
            },
         })

         return user
      })

      return NextResponse.json({ user: newUser }, { status: 201 })
   } catch (error) {
      console.error(error)
      return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
   }
})
