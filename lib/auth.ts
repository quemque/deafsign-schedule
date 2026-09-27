import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = new TextEncoder().encode(
   process.env.JWT_SECRET || 'your-super-secret-key-change-in-production',
)

export const hashPassword = async (password: string): Promise<string> => {
   return bcrypt.hash(password, 10)
}

export const verifyPassword = async (
   password: string,
   hash: string,
): Promise<boolean> => {
   return bcrypt.compare(password, hash)
}

export const createToken = async (payload: {
   userId: string
   role: string
   login: string
}): Promise<string> => {
   return new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET)
}

export const verifyToken = async (token: string) => {
   try {
      const { payload } = await jwtVerify(token, JWT_SECRET)
      return payload
   } catch {
      return null
   }
}

export const getSession = async () => {
   const cookieStore = await cookies()
   const token = cookieStore.get('auth-token')?.value

   if (!token) return null

   const payload = await verifyToken(token)
   if (!payload) return null

   return {
      userId: payload.userId as string,
      role: payload.role as string,
      login: payload.login as string,
   }
}

export const getCurrentUser = async () => {
   const session = await getSession()
   if (!session) return null

   const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
         id: true,
         email: true,
         login: true,
         name: true,
         role: true,
         isActive: true,
      },
   })

   if (!user || !user.isActive) return null

   return user
}

export const setAuthCookie = async (token: string) => {
   const cookieStore = await cookies()
   cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
   })
}

export const clearAuthCookie = async () => {
   const cookieStore = await cookies()
   cookieStore.set('auth-token', '', {
      path: '/',
      maxAge: 0,
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
   })
}
