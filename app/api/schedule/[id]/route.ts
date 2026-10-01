export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, parseQueryParams, parseJsonBody } from '@/lib/apiGuard'
import {
   deleteLessonQuerySchema,
   updateLessonSchema,
} from '@/schemas/schedule.schema'

export const DELETE = withAuth<{ id: string }>(
   ['ADMIN'],
   async (req, { params }) => {
      const { id } = params
      const parsed = parseQueryParams(req.url, deleteLessonQuerySchema)
      if ('errorResponse' in parsed) {
         return parsed.errorResponse
      }

      const { mode, date } = parsed.data

      const lesson = await prisma.lesson.findUnique({
         where: { id },
      })

      if (!lesson) {
         return NextResponse.json(
            { error: 'Занятие не найдено' },
            { status: 404 },
         )
      }

      if (mode === 'all' || !lesson.isRecurring) {
         await prisma.lesson.delete({
            where: { id },
         })
         return NextResponse.json({ success: true })
      }

      if (!date) {
         return NextResponse.json(
            { error: 'Укажите дату занятия для выборочного удаления' },
            { status: 400 },
         )
      }

      const [y, m, d] = date.split('-').map(Number)
      const targetDate = new Date(Date.UTC(y, m - 1, d))

      if (mode === 'this') {
         await prisma.$transaction([
            prisma.lessonCancellation.upsert({
               where: {
                  lessonId_date: {
                     lessonId: id,
                     date: targetDate,
                  },
               },
               create: {
                  lessonId: id,
                  date: targetDate,
               },
               update: {},
            }),
            prisma.lessonOverride.deleteMany({
               where: {
                  lessonId: id,
                  date: targetDate,
               },
            }),
            prisma.lessonReschedule.deleteMany({
               where: {
                  lessonId: id,
                  originalDate: targetDate,
               },
            }),
         ])
         return NextResponse.json({ success: true })
      }

      if (mode === 'future') {
         const dayBefore = new Date(targetDate)
         dayBefore.setUTCDate(dayBefore.getUTCDate() - 1)

         await prisma.$transaction([
            prisma.lesson.update({
               where: { id },
               data: {
                  endDate: dayBefore,
               },
            }),
            prisma.lessonCancellation.deleteMany({
               where: {
                  lessonId: id,
                  date: { gte: targetDate },
               },
            }),
            prisma.lessonOverride.deleteMany({
               where: {
                  lessonId: id,
                  date: { gte: targetDate },
               },
            }),
            prisma.lessonReschedule.deleteMany({
               where: {
                  lessonId: id,
                  originalDate: { gte: targetDate },
               },
            }),
         ])
         return NextResponse.json({ success: true })
      }

      return NextResponse.json(
         { error: 'Неизвестный режим удаления' },
         { status: 400 },
      )
   },
)

export const PUT = withAuth<{ id: string }>(
   ['ADMIN'],
   async (req, { params }) => {
      const { id } = params
      const parsed = await parseJsonBody(req, updateLessonSchema)
      if ('errorResponse' in parsed) {
         return parsed.errorResponse
      }

      const {
         subject,
         color,
         totalLessons,
         teacherId,
         customTeacherName,
         teacherByDay,
         timeByDay,
         daysOfWeek,
         teacherScope,
         activeDate,
      } = parsed.data

      if (
         teacherScope === 'this' &&
         activeDate &&
         customTeacherName !== undefined
      ) {
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
               customTeacherName: customTeacherName || null,
            },
            update: {
               customTeacherName: customTeacherName || null,
            },
         })

         const updated = await prisma.lesson.findUnique({
            where: { id },
            include: {
               teacher: { select: { id: true, name: true } },
               comments: true,
               cancellations: true,
               overrides: true,
               reschedules: true,
            },
         })
         return NextResponse.json({ lesson: updated })
      }

      const updated = await prisma.lesson.update({
         where: { id },
         data: {
            subject: subject !== undefined ? subject : undefined,
            color: color !== undefined ? color : undefined,
            totalLessons: totalLessons !== undefined ? totalLessons : undefined,
            teacherId: teacherId !== undefined ? teacherId : undefined,
            customTeacherName:
               customTeacherName !== undefined ? customTeacherName : undefined,
            teacherByDay:
               teacherByDay !== undefined ? (teacherByDay as any) : undefined,
            timeByDay: timeByDay !== undefined ? (timeByDay as any) : undefined,
            daysOfWeek:
               daysOfWeek !== undefined ? (daysOfWeek as any) : undefined,
         },
         include: {
            teacher: { select: { id: true, name: true } },
            comments: true,
            cancellations: true,
            overrides: true,
            reschedules: true,
         },
      })

      return NextResponse.json({ lesson: updated })
   },
)
