import { NextRequest, NextResponse } from 'next/server'
import { getSession, hashPassword } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
   const session = await getSession()
   if (!session || session.role !== 'ADMIN') {
      return null
   }
   return session
}

export async function GET() {
   const session = await requireAdmin()
   if (!session) {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
   }

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
}

export async function POST(request: NextRequest) {
   const session = await requireAdmin()
   if (!session) {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
   }

   try {
      const { email, login, password, name, role } = await request.json()

      if (!email || !login || !password || !name) {
         return NextResponse.json(
            { error: 'Заполните все обязательные поля' },
            { status: 400 },
         )
      }

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

      const user = await prisma.user.create({
         data: {
            email,
            login,
            passwordHash,
            name,
            role: role || 'USER',
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
            entityId: user.id,
            userId: session.userId,
            metadata: { role: user.role },
         },
      })

      return NextResponse.json({ user })
   } catch (error) {
      console.error(error)
      return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
   }
}
