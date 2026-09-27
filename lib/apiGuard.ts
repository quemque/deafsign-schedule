import { NextRequest, NextResponse } from 'next/server'
import { ZodSchema, ZodError } from 'zod'
import { Role, User } from '@prisma/client'
import { getCurrentUser } from '@/lib/auth'

export type AuthenticatedUser = Omit<User, 'passwordHash'>

type RouteContext<TParams = Record<string, string>> = {
   params: Promise<TParams>
}

type AuthenticatedHandler<TParams = Record<string, string>> = (
   req: NextRequest,
   context: {
      user: AuthenticatedUser
      params: TParams
   },
) => Promise<NextResponse>

export function withAuth<TParams = Record<string, string>>(
   allowedRoles: Role[],
   handler: AuthenticatedHandler<TParams>,
) {
   return async (
      req: NextRequest,
      routeContext: RouteContext<TParams>,
   ): Promise<NextResponse> => {
      const user = await getCurrentUser()

      if (!user) {
         return NextResponse.json(
            { error: 'Требуется авторизация' },
            { status: 401 },
         )
      }

      if (!allowedRoles.includes(user.role)) {
         return NextResponse.json(
            { error: 'Недостаточно прав доступа' },
            { status: 403 },
         )
      }

      const params = await routeContext.params
      return handler(req, { user: user as AuthenticatedUser, params })
   }
}

export async function parseJsonBody<T>(
   req: NextRequest,
   schema: ZodSchema<T>,
): Promise<{ data: T } | { errorResponse: NextResponse }> {
   try {
      const rawBody = await req.json()
      const data = schema.parse(rawBody)
      return { data }
   } catch (error) {
      if (error instanceof ZodError) {
         const firstError = error.issues[0]?.message || 'Некорректные данные'
         return {
            errorResponse: NextResponse.json(
               { error: firstError, details: error.issues },
               { status: 400 },
            ),
         }
      }
      return {
         errorResponse: NextResponse.json(
            { error: 'Невалидный JSON в запросе' },
            { status: 400 },
         ),
      }
   }
}

export function parseQueryParams<T>(
   url: string,
   schema: ZodSchema<T>,
): { data: T } | { errorResponse: NextResponse } {
   try {
      const { searchParams } = new URL(url)
      const rawParams = Object.fromEntries(searchParams.entries())
      const data = schema.parse(rawParams)
      return { data }
   } catch (error) {
      if (error instanceof ZodError) {
         const firstError =
            error.issues[0]?.message || 'Некорректные параметры URL'
         return {
            errorResponse: NextResponse.json(
               { error: firstError, details: error.issues },
               { status: 400 },
            ),
         }
      }
      return {
         errorResponse: NextResponse.json(
            { error: 'Ошибка разбора параметров URL' },
            { status: 400 },
         ),
      }
   }
}
