export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { withAuth, parseJsonBody, parseQueryParams } from '@/lib/apiGuard'
import {
   createLessonSchema,
   scheduleListQuerySchema,
} from '@/schemas/schedule.schema'

export async function GET(req: NextRequest) {
   try {
      const parsed = parseQueryParams(req.url, scheduleListQuerySchema)
      if ('errorResponse' in parsed) {
         return parsed.errorResponse
      }

      const { startDate, endDate } = parsed.data
      const whereClause: Prisma.LessonWhereInput = {}

      let dateFilter: { gte: Date; lte: Date } | undefined

      if (startDate && endDate) {
         const rangeStart = new Date(startDate)
         rangeStart.setUTCHours(0, 0, 0, 0)

         const rangeEnd = new Date(endDate)
         rangeEnd.setUTCHours(23, 59, 59, 999)

         dateFilter = { gte: rangeStart, lte: rangeEnd }

         whereClause.OR = [
            {
               isRecurring: true,
               startsAt: { lte: rangeEnd },
               OR: [{ endDate: null }, { endDate: { gte: rangeStart } }],
            },
            {
               isRecurring: false,
               startsAt: {
                  gte: rangeStart,
                  lte: rangeEnd,
               },
            },
            {
               reschedules: {
                  some: {
                     newStartsAt: {
                        gte: rangeStart,
                        lte: rangeEnd,
                     },
                  },
               },
            },
         ]
      }

      const relationsInclude: Prisma.LessonInclude = dateFilter
         ? {
              teacher: { select: { id: true, name: true } },
              comments: { where: { date: dateFilter } },
              cancellations: { where: { date: dateFilter } },
              overrides: { where: { date: dateFilter } },
              reschedules: {
                 where: {
                    OR: [
                       { originalDate: dateFilter },
                       { newStartsAt: dateFilter },
                    ],
                 },
              },
           }
         : {
              teacher: { select: { id: true, name: true } },
              comments: true,
              cancellations: true,
              overrides: true,
              reschedules: true,
           }

      const lessons = await prisma.lesson.findMany({
         where: whereClause,
         orderBy: { startsAt: 'asc' },
         include: relationsInclude,
      })

      return NextResponse.json({ lessons })
   } catch (error) {
      console.error(error)
      return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
   }
}

export const POST = withAuth(['ADMIN'], async (req, { user }) => {
   const parsed = await parseJsonBody(req, createLessonSchema)
   if ('errorResponse' in parsed) {
      return parsed.errorResponse
   }

   const {
      subject,
      teacherId,
      customTeacherName,
      teacherByDay,
      timeByDay,
      color,
      totalLessons,
      isRecurring,
      date,
      dayOfWeek,
      daysOfWeek,
      startTime,
      endTime,
      startsAt: rawStartsAt,
      endsAt: rawEndsAt,
   } = parsed.data

   let startsAt: Date
   let endsAt: Date
   let recurring = false
   let resolvedDaysOfWeek = daysOfWeek || []
   let resolvedDayOfWeek = dayOfWeek || null

   if (isRecurring) {
      const selectedDays =
         resolvedDaysOfWeek.length > 0
            ? resolvedDaysOfWeek
            : dayOfWeek
              ? [dayOfWeek]
              : []

      if (selectedDays.length === 0 || !startTime || !endTime || !date) {
         return NextResponse.json(
            { error: 'Укажите дату начала, дни недели и время' },
            { status: 400 },
         )
      }

      recurring = true
      resolvedDaysOfWeek = selectedDays
      resolvedDayOfWeek = selectedDays[0]

      const [y, m, d] = date.split('-').map(Number)
      const dayIndexMap = [
         'SUNDAY',
         'MONDAY',
         'TUESDAY',
         'WEDNESDAY',
         'THURSDAY',
         'FRIDAY',
         'SATURDAY',
      ]
      const firstDayKey = dayIndexMap[new Date(y, m - 1, d).getDay()]
      const customSlot = timeByDay?.[firstDayKey]

      const activeStartTime = customSlot?.startTime || startTime
      const activeEndTime = customSlot?.endTime || endTime

      const [sh, sm] = activeStartTime.split(':').map(Number)
      const [eh, em] = activeEndTime.split(':').map(Number)

      startsAt = new Date(Date.UTC(y, m - 1, d, sh, sm, 0, 0))
      endsAt = new Date(Date.UTC(y, m - 1, d, eh, em, 0, 0))
   } else if (rawStartsAt && rawEndsAt) {
      startsAt = new Date(rawStartsAt)
      endsAt = new Date(rawEndsAt)
   } else if (date && startTime && endTime) {
      const [sh, sm] = startTime.split(':').map(Number)
      const [eh, em] = endTime.split(':').map(Number)
      const [y, m, d] = date.split('-').map(Number)

      startsAt = new Date(Date.UTC(y, m - 1, d, sh, sm, 0, 0))
      endsAt = new Date(Date.UTC(y, m - 1, d, eh, em, 0, 0))
   } else {
      return NextResponse.json(
         { error: 'Укажите дату и время занятия' },
         { status: 400 },
      )
   }

   try {
      const lesson = await prisma.lesson.create({
         data: {
            subject,
            teacherId: teacherId || null,
            customTeacherName: customTeacherName || null,
            teacherByDay: teacherByDay
               ? (teacherByDay as Prisma.InputJsonValue)
               : Prisma.DbNull,
            timeByDay: timeByDay
               ? (timeByDay as Prisma.InputJsonValue)
               : Prisma.DbNull,
            room: null,
            color: color || '#8BA888',
            totalLessons: recurring ? totalLessons : null,
            startsAt,
            endsAt,
            isRecurring: recurring,
            dayOfWeek: resolvedDayOfWeek,
            daysOfWeek: resolvedDaysOfWeek,
            createdBy: user.id,
         },
         include: {
            teacher: { select: { id: true, name: true } },
            comments: true,
            cancellations: true,
            overrides: true,
            reschedules: true,
         },
      })

      return NextResponse.json({ lesson }, { status: 201 })
   } catch (error) {
      console.error(error)
      return NextResponse.json(
         { error: 'Ошибка при создании занятия' },
         { status: 500 },
      )
   }
})
