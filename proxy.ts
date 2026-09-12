import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
   process.env.JWT_SECRET || 'your-super-secret-key-change-in-production',
)

export async function middleware(request: NextRequest) {
   const { pathname } = request.nextUrl
   const token = request.cookies.get('auth-token')?.value

   const isAuthPage = pathname.startsWith('/login')
   const isAdminPage = pathname.startsWith('/admin')
   const isProtectedPage = pathname.startsWith('/schedule')

   if (!token) {
      if (isAdminPage || isProtectedPage) {
         return NextResponse.redirect(new URL('/login', request.url))
      }
      return NextResponse.next()
   }

   try {
      const { payload } = await jwtVerify(token, JWT_SECRET)
      const role = payload.role as string

      if (isAuthPage) {
         return NextResponse.redirect(new URL('/schedule', request.url))
      }

      if (isAdminPage && role !== 'ADMIN') {
         return NextResponse.redirect(new URL('/schedule', request.url))
      }

      return NextResponse.next()
   } catch {
      return NextResponse.redirect(new URL('/login', request.url))
   }
}

export const config = {
   matcher: ['/login', '/admin/:path*', '/schedule/:path*'],
}
