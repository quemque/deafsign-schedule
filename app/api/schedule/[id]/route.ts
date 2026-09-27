import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { DayOfWeek, Prisma } from '@prisma/client'

export async function PATCH(
   req: NextRequest,
   { params }: { params: Promise<{ id: string }> },
) {
   const { id } = await params

   const user = await getCurrentUser()
   if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
   }

   const body = await req.json()

   if (body.action === 'reschedule') {
      const { originalDate, newDate, newStartTime, newEndTime } = body
      if (!originalDate || !newDate || !newStartTime || !newEndTime) {
         return NextResponse.json(
            { error: 'Заполните все параметры переноса' },
            { status: 400 },
         )
      }

      const [oy, om, od] = originalDate.split('-').map(Number)
      const origDateObj = new Date(Date.UTC(oy, om - 1, od))

      const [ny, nm, nd] = newDate.split('-').map(Number)
      const [sh, sm] = newStartTime.split(':').map(Number)
      const [eh, em] = newEndTime.split(':').map(Number)

      const newStartsAt = new Date(Date.UTC(ny, nm - 1, nd, sh, sm, 0, 0))
      const newEndsAt = new Date(Date.UTC(ny, nm - 1, nd, eh, em, 0, 0))

      await prisma.lessonReschedule.upsert({
         where: {
            lessonId_originalDate: {
               lessonId: id,
               originalDate: origDateObj,
            },
         },
         create: {
            lessonId: id,
            originalDate: origDateObj,
            newStartsAt,
            newEndsAt,
         },
         update: {
            newStartsAt,
            newEndsAt,
         },
      })

      const lesson = await prisma.lesson.findUnique({
         where: { id },
         include: {
            teacher: { select: { id: true, name: true } },
            comments: true,
            cancellations: true,
            overrides: true,
            reschedules: true,
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
            customTeacherName: data.customTeacherName?.trim() || null,
         },
         update: {
            customTeacherName: data.customTeacherName?.trim() || null,
         },
      })

      const lesson = await prisma.lesson.update({
         where: { id },
         data: {
            subject: data.subject,
            color: data.color || undefined,
            teacherByDay:
               data.teacherByDay !== undefined
                  ? data.teacherByDay || Prisma.DbNull
                  : undefined,
            timeByDay:
               data.timeByDay !== undefined
                  ? data.timeByDay || Prisma.DbNull
                  : undefined,
            daysOfWeek:
               data.daysOfWeek && data.daysOfWeek.length > 0
                  ? (data.daysOfWeek as DayOfWeek[])
                  : undefined,
            dayOfWeek:
               data.daysOfWeek && data.daysOfWeek.length > 0
                  ? (data.daysOfWeek[0] as DayOfWeek)
                  : undefined,
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
            reschedules: true,
         },
      })

      return NextResponse.json({ lesson })
   }

   const lesson = await prisma.lesson.update({
      where: { id },
      data: {
         subject: data.subject,
         teacherId: data.teacherId || null,
         customTeacherName: data.customTeacherName?.trim() || null,
         teacherByDay:
            data.teacherByDay !== undefined
               ? data.teacherByDay || Prisma.DbNull
               : undefined,
         timeByDay:
            data.timeByDay !== undefined
               ? data.timeByDay || Prisma.DbNull
               : undefined,
         color: data.color || undefined,
         daysOfWeek:
            data.daysOfWeek && data.daysOfWeek.length > 0
               ? (data.daysOfWeek as DayOfWeek[])
               : undefined,
         dayOfWeek:
            data.daysOfWeek && data.daysOfWeek.length > 0
               ? (data.daysOfWeek[0] as DayOfWeek)
               : undefined,
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
         reschedules: true,
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
