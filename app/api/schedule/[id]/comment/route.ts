import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, parseJsonBody } from '@/lib/apiGuard'
import { lessonCommentSchema } from '@/schemas/schedule.schema'

export const POST = withAuth<{ id: string }>(
   ['ADMIN', 'TEACHER'],
   async (req, { user, params }) => {
      const { id: lessonId } = params

      const parsed = await parseJsonBody(req, lessonCommentSchema)
      if ('errorResponse' in parsed) {
         return parsed.errorResponse
      }

      const { text, date } = parsed.data
      const targetDate = new Date(`${date}T00:00:00.000Z`)

      try {
         if (!text) {
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
   },
)
