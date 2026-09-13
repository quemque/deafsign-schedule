import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function PATCH(
   req: NextRequest,
   { params }: { params: Promise<{ id: string }> },
) {
   const { id } = await params

   const user = await getCurrentUser()
   if (!user || (user.role !== 'ADMIN' && user.role !== 'TEACHER')) {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
   }

   const body = await req.json()

   if (user.role === 'TEACHER') {
      const lesson = await prisma.lesson.findUnique({
         where: { id },
         include: { teacher: { select: { id: true, name: true } } },
      })
      return NextResponse.json({ lesson })
   }

   const lesson = await prisma.lesson.update({
      where: { id },
      data: {
         subject: body.subject,
         room: body.room ?? null,
         teacherId: body.teacherId || null,
         customTeacherName: body.customTeacherName
            ? body.customTeacherName.trim()
            : null,
         color: body.color || undefined,
         totalLessons:
            body.totalLessons !== undefined
               ? body.totalLessons
                  ? Number(body.totalLessons)
                  : null
               : undefined,
         startsAt: body.startsAt ? new Date(body.startsAt) : undefined,
         endsAt: body.endsAt ? new Date(body.endsAt) : undefined,
      },
      include: {
         teacher: { select: { id: true, name: true } },
         comments: true,
         cancellations: true,
      },
   })

   return NextResponse.json({ lesson })
}

export async function DELETE(
   req: NextRequest,
   { params }: { params: Promise<{ id: string }> },
) {
   const { id } = await params
   const user = await getCurrentUser()
   if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
   }

   const { searchParams } = new URL(req.url)
   const mode = searchParams.get('mode') || 'all'
   const dateStr = searchParams.get('date')

   if (mode === 'this') {
      if (!dateStr) {
         return NextResponse.json({ error: 'Не указана дата' }, { status: 400 })
      }
      const targetDate = new Date(`${dateStr}T00:00:00.000Z`)

      await prisma.lessonCancellation.upsert({
         where: {
            lessonId_date: { lessonId: id, date: targetDate },
         },
         create: { lessonId: id, date: targetDate },
         update: {},
      })
      return NextResponse.json({ ok: true, mode: 'this' })
   }

   if (mode === 'future') {
      if (!dateStr) {
         return NextResponse.json({ error: 'Не указана дата' }, { status: 400 })
      }
      const cutoffDate = new Date(`${dateStr}T00:00:00.000Z`)
      cutoffDate.setUTCDate(cutoffDate.getUTCDate() - 1)

      await prisma.lesson.update({
         where: { id },
         data: { endDate: cutoffDate },
      })
      return NextResponse.json({ ok: true, mode: 'future' })
   }

   await prisma.lesson.delete({ where: { id } })
   return NextResponse.json({ ok: true, mode: 'all' })
}
