import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, createToken, setAuthCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
   try {
      const { login, password } = await request.json()

      if (!login || !password) {
         return NextResponse.json(
            { error: 'Введите логин и пароль' },
            { status: 400 },
         )
      }

      const user = await prisma.user.findFirst({
         where: {
            OR: [{ login }, { email: login }],
         },
      })

      if (!user || !user.isActive) {
         return NextResponse.json(
            { error: 'Неверный логин или пароль' },
            { status: 401 },
         )
      }

      const isValid = await verifyPassword(password, user.passwordHash)

      if (!isValid) {
         return NextResponse.json(
            { error: 'Неверный логин или пароль' },
            { status: 401 },
         )
      }

      const token = await createToken({
         userId: user.id,
         role: user.role,
         login: user.login,
      })

      await setAuthCookie(token)

      await prisma.user.update({
         where: { id: user.id },
         data: { lastLoginAt: new Date() },
      })

      await prisma.auditLog.create({
         data: {
            action: 'login',
            entity: 'user',
            entityId: user.id,
            userId: user.id,
         },
      })

      return NextResponse.json({
         success: true,
         user: {
            id: user.id,
            name: user.name,
            role: user.role,
         },
      })
   } catch (error) {
      console.error(error)
      return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
   }
}
