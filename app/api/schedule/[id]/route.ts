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
         include: {
            teacher: { select: { id: true, name: true } },
            overrides: true,
         },
      })
      return NextResponse.json({ lesson })
   }

   const { teacherScope, activeDate, ...data } = body

   if (teacherScope === 'this' && activeDate) {
      const [y, m, d] = activeDate.split('-').map(Number)
      const targetDate = new Date(Date.UTC(y, m - 1, d))

      await prisma.lessonOverride.upsert({
         where: {
            lessonId_date: {
               lessonId: id,
               date: targetDate,
            },
         },
         create: {
            lessonId: id,
            date: targetDate,
            customTeacherName: data.customTeacherName
               ? data.customTeacherName.trim()
               : null,
         },
         update: {
            customTeacherName: data.customTeacherName
               ? data.customTeacherName.trim()
               : null,
         },
      })

      const lesson = await prisma.lesson.update({
         where: { id },
         data: {
            subject: data.subject,
            color: data.color || undefined,
            totalLessons:
               data.totalLessons !== undefined
                  ? data.totalLessons
                     ? Number(data.totalLessons)
                     : null
                  : undefined,
         },
         include: {
            teacher: { select: { id: true, name: true } },
            comments: true,
            cancellations: true,
            overrides: true,
         },
      })

      return NextResponse.json({ lesson })
   }

   const lesson = await prisma.lesson.update({
      where: { id },
      data: {
         subject: data.subject,
         teacherId: data.teacherId || null,
         customTeacherName: data.customTeacherName
            ? data.customTeacherName.trim()
            : null,
         color: data.color || undefined,
         totalLessons:
            data.totalLessons !== undefined
               ? data.totalLessons
                  ? Number(data.totalLessons)
                  : null
               : undefined,
         startsAt: data.startsAt ? new Date(data.startsAt) : undefined,
         endsAt: data.endsAt ? new Date(data.endsAt) : undefined,
      },
      include: {
         teacher: { select: { id: true, name: true } },
         comments: true,
         cancellations: true,
         overrides: true,
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
