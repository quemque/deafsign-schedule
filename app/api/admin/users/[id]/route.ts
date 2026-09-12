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
   const body = await request.json()

   const data: any = {}
   if (body.name) data.name = body.name
   if (body.email) data.email = body.email
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
         { error: 'Нельзя удалить свой аккаунт' },
         { status: 400 },
      )
   }

   await prisma.user.update({
      where: { id },
      data: { isActive: false },
   })

   return NextResponse.json({ success: true })
}
