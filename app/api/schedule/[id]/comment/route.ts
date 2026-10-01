export const dynamic = 'force-dynamic'

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

      const cleanDate = date.includes('T') ? date.split('T')[0] : date
      const [y, m, d] = cleanDate.split('-').map(Number)
      const targetDate = new Date(Date.UTC(y, m - 1, d))

      const trimmedText = text?.trim() ?? ''

      try {
         if (!trimmedText) {
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
               text: trimmedText,
               date: targetDate,
               lessonId,
               authorId: user.id,
            },
            update: {
               text: trimmedText,
               authorId: user.id,
            },
         })

         return NextResponse.json({ success: true, comment })
      } catch (error) {
         console.error('Ошибка сохранения комментария:', error)
         return NextResponse.json(
            { error: 'Ошибка сохранения комментария' },
            { status: 500 },
         )
      }
   },
)
