import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose/jwt/verify'

const JWT_SECRET = new TextEncoder().encode(
   process.env.JWT_SECRET || 'your-super-secret-key-change-in-production',
)

const PUBLIC_PATHS = ['/login', '/register']

export async function middleware(request: NextRequest) {
   const { pathname } = request.nextUrl
   const token = request.cookies.get('auth-token')?.value

   const isAuthPage = PUBLIC_PATHS.some((path) => pathname.startsWith(path))
   const isAdminPage = pathname.startsWith('/admin')

   if (!token) {
      if (isAuthPage) {
         return NextResponse.next()
      }
      return NextResponse.redirect(new URL('/login', request.url))
   }

   try {
      const { payload } = await jwtVerify(token, JWT_SECRET)
      const role = payload.role as string

      if (isAuthPage) {
         return NextResponse.redirect(new URL('/', request.url))
      }

      if (isAdminPage && role !== 'ADMIN') {
         return NextResponse.redirect(new URL('/', request.url))
      }

      return NextResponse.next()
   } catch {
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('auth-token')
      return response
   }
}

export const config = {
   matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
