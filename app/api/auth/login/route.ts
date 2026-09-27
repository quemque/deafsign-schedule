import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, createToken, setAuthCookie } from '@/lib/auth'
import { rateLimit } from '@/lib/rateLimit'
import { parseJsonBody } from '@/lib/apiGuard'
import { loginSchema } from '@/schemas/auth.schema'

const authLimiter = rateLimit({
   interval: 60 * 1000,
   uniqueTokenPerInterval: 500,
})

export async function POST(request: NextRequest) {
   const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'anonymous'

   const limitResult = authLimiter.check(5, clientIp)
   if (!limitResult.success) {
      return NextResponse.json(
         { error: 'Слишком много попыток входа. Повторите через минуту.' },
         { status: 429 },
      )
   }

   const parsed = await parseJsonBody(request, loginSchema)
   if ('errorResponse' in parsed) {
      return parsed.errorResponse
   }

   const { login, password } = parsed.data

   try {
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
            ipAddress: clientIp,
            userAgent: request.headers.get('user-agent'),
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
