import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(
   req: NextRequest,
   { params }: { params: Promise<{ id: string }> },
) {
   try {
      const user = await getCurrentUser()
      if (!user || (user.role !== 'ADMIN' && user.role !== 'TEACHER')) {
         return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
      }

      const { id: lessonId } = await params
      const { text, date } = await req.json()

      if (!date) {
         return NextResponse.json({ error: 'Не указана дата' }, { status: 400 })
      }

      const targetDate = new Date(`${date}T00:00:00.000Z`)

      if (!text || text.trim() === '') {
         await prisma.comment.deleteMany({
            where: {
               lessonId,
               date: targetDate,
            },
         })
         return NextResponse.json({ success: true, comment: null })
      }

      const comment = await prisma.comment.upsert({
         where: {
            lessonId_date: {
               lessonId,
               date: targetDate,
            },
         },
         create: {
            text,
            date: targetDate,
            lessonId,
            authorId: user.id,
         },
         update: {
            text,
            authorId: user.id,
         },
      })

      return NextResponse.json({ success: true, comment })
   } catch (error) {
      console.error(error)
      return NextResponse.json(
         { error: 'Ошибка сохранения комментария' },
         { status: 500 },
      )
   }
}
