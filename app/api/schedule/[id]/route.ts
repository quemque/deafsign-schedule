import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { withAuth, parseJsonBody, parseQueryParams } from '@/lib/apiGuard'
import {
   patchLessonSchema,
   deleteLessonQuerySchema,
} from '@/schemas/schedule.schema'

export const PATCH = withAuth<{ id: string }>(
   ['ADMIN'],
   async (req, { params }) => {
      const { id } = params

      const parsed = await parseJsonBody(req, patchLessonSchema)
      if ('errorResponse' in parsed) {
         return parsed.errorResponse
      }

      const body = parsed.data

      if (body.action === 'reschedule') {
         const { originalDate, newDate, newStartTime, newEndTime } = body
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
               customTeacherName: data.customTeacherName || null,
            },
            update: {
               customTeacherName: data.customTeacherName || null,
            },
         })

         const lesson = await prisma.lesson.update({
            where: { id },
            data: {
               subject: data.subject,
               color: data.color,
               teacherByDay:
                  data.teacherByDay !== undefined
                     ? data.teacherByDay
                        ? (data.teacherByDay as Prisma.InputJsonValue)
                        : Prisma.DbNull
                     : undefined,
               timeByDay:
                  data.timeByDay !== undefined
                     ? data.timeByDay
                        ? (data.timeByDay as Prisma.InputJsonValue)
                        : Prisma.DbNull
                     : undefined,
               daysOfWeek: data.daysOfWeek,
               dayOfWeek: data.dayOfWeek,
               totalLessons: data.totalLessons,
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
            customTeacherName: data.customTeacherName || null,
            teacherByDay:
               data.teacherByDay !== undefined
                  ? data.teacherByDay
                     ? (data.teacherByDay as Prisma.InputJsonValue)
                     : Prisma.DbNull
                  : undefined,
            timeByDay:
               data.timeByDay !== undefined
                  ? data.timeByDay
                     ? (data.timeByDay as Prisma.InputJsonValue)
                     : Prisma.DbNull
                  : undefined,
            color: data.color,
            daysOfWeek: data.daysOfWeek,
            dayOfWeek: data.dayOfWeek,
            totalLessons: data.totalLessons,
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
   },
)

export const DELETE = withAuth<{ id: string }>(
   ['ADMIN'],
   async (req, { params }) => {
      const { id } = params

      const parsed = parseQueryParams(req.url, deleteLessonQuerySchema)
      if ('errorResponse' in parsed) {
         return parsed.errorResponse
      }

      const { mode, date: dateStr } = parsed.data

      if (mode === 'this') {
         if (!dateStr) {
            return NextResponse.json(
               { error: 'Не указана дата' },
               { status: 400 },
            )
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
            return NextResponse.json(
               { error: 'Не указана дата' },
               { status: 400 },
            )
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
   },
)
