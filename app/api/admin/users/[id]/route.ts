import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { withAuth, parseJsonBody } from '@/lib/apiGuard'
import { updateUserSchema } from '@/schemas/user.schema'
import { Prisma } from '@prisma/client'

export const PATCH = withAuth<{ id: string }>(
   ['ADMIN'],
   async (req, { params, user: adminUser }) => {
      const { id } = params

      const parsed = await parseJsonBody(req, updateUserSchema)
      if ('errorResponse' in parsed) {
         return parsed.errorResponse
      }

      const body = parsed.data

      try {
         if (body.login || body.email) {
            const existing = await prisma.user.findFirst({
               where: {
                  OR: [
                     ...(body.login ? [{ login: body.login }] : []),
                     ...(body.email ? [{ email: body.email }] : []),
                  ],
                  NOT: { id },
               },
            })

            if (existing) {
               return NextResponse.json(
                  {
                     error: 'Пользователь с таким логином или email уже существует',
                  },
                  { status: 409 },
               )
            }
         }

         const updateData: Prisma.UserUpdateInput = {}
         if (body.name) updateData.name = body.name
         if (body.login) updateData.login = body.login
         if (body.email) updateData.email = body.email
         if (body.role) updateData.role = body.role
         if (typeof body.isActive === 'boolean')
            updateData.isActive = body.isActive
         if (body.password) {
            updateData.passwordHash = await hashPassword(body.password)
         }

         const updatedUser = await prisma.$transaction(async (tx) => {
            const user = await tx.user.update({
               where: { id },
               data: updateData,
               select: {
                  id: true,
                  email: true,
                  login: true,
                  name: true,
                  role: true,
                  isActive: true,
               },
            })

            await tx.auditLog.create({
               data: {
                  action: 'update',
                  entity: 'user',
                  entityId: id,
                  userId: adminUser.id,
                  metadata: Object.keys(updateData),
               },
            })

            return user
         })

         return NextResponse.json({ user: updatedUser })
      } catch (error) {
         console.error(error)
         return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
      }
   },
)

export const DELETE = withAuth<{ id: string }>(
   ['ADMIN'],
   async (_req, { user: adminUser, params }) => {
      const { id } = params

      if (id === adminUser.id) {
         return NextResponse.json(
            { error: 'Нельзя отключить свой собственный аккаунт' },
            { status: 400 },
         )
      }

      await prisma.$transaction(async (tx) => {
         await tx.user.update({
            where: { id },
            data: { isActive: false },
         })

         await tx.auditLog.create({
            data: {
               action: 'deactivate',
               entity: 'user',
               entityId: id,
               userId: adminUser.id,
            },
         })
      })

      return NextResponse.json({ success: true })
   },
)
