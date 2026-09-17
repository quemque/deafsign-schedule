import { NextRequest, NextResponse } from 'next/server'
import { getSession, hashPassword } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
   const session = await getSession()
   if (!session || session.role !== 'ADMIN') return null
   return session
}

export async function PATCH(
   request: NextRequest,
   { params }: { params: Promise<{ id: string }> },
) {
   const session = await requireAdmin()
   if (!session) {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
   }

   const { id } = await params

   try {
      const body = await request.json()

      if (body.login || body.email) {
         const existing = await prisma.user.findFirst({
            where: {
               OR: [
                  ...(body.login ? [{ login: body.login.trim() }] : []),
                  ...(body.email ? [{ email: body.email.trim() }] : []),
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

      const data: any = {}
      if (body.name) data.name = body.name.trim()
      if (body.login) data.login = body.login.trim()
      if (body.email) data.email = body.email.trim()
      if (body.role) data.role = body.role
      if (typeof body.isActive === 'boolean') data.isActive = body.isActive
      if (body.password) data.passwordHash = await hashPassword(body.password)

      const user = await prisma.user.update({
         where: { id },
         data,
         select: {
            id: true,
            email: true,
            login: true,
            name: true,
            role: true,
            isActive: true,
         },
      })

      return NextResponse.json({ user })
   } catch (error) {
      console.error(error)
      return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
   }
}

export async function DELETE(
   _request: NextRequest,
   { params }: { params: Promise<{ id: string }> },
) {
   const session = await requireAdmin()
   if (!session) {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
   }

   const { id } = await params

   if (id === session.userId) {
      return NextResponse.json(
         { error: 'Нельзя отключить свой аккаунт' },
         { status: 400 },
      )
   }

   await prisma.user.update({
      where: { id },
      data: { isActive: false },
   })

   return NextResponse.json({ success: true })
}
