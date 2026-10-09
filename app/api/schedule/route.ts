export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma, DayOfWeek } from '@prisma/client'
import { withAuth, parseJsonBody, parseQueryParams } from '@/lib/apiGuard'
import { getCurrentUser } from '@/lib/auth'
import {
   createLessonSchema,
   scheduleListQuerySchema,
} from '@/schemas/schedule.schema'

const DAY_MAP: Record<string, DayOfWeek> = {
   mon: DayOfWeek.MONDAY,
   tue: DayOfWeek.TUESDAY,
   wed: DayOfWeek.WEDNESDAY,
   thu: DayOfWeek.THURSDAY,
   fri: DayOfWeek.FRIDAY,
   sat: DayOfWeek.SATURDAY,
   sun: DayOfWeek.SUNDAY,
   monday: DayOfWeek.MONDAY,
   tuesday: DayOfWeek.TUESDAY,
   wednesday: DayOfWeek.WEDNESDAY,
   thursday: DayOfWeek.THURSDAY,
   friday: DayOfWeek.FRIDAY,
   saturday: DayOfWeek.SATURDAY,
   sunday: DayOfWeek.SUNDAY,
   MONDAY: DayOfWeek.MONDAY,
   TUESDAY: DayOfWeek.TUESDAY,
   WEDNESDAY: DayOfWeek.WEDNESDAY,
   THURSDAY: DayOfWeek.THURSDAY,
   FRIDAY: DayOfWeek.FRIDAY,
   SATURDAY: DayOfWeek.SATURDAY,
   SUNDAY: DayOfWeek.SUNDAY,
}

function normalizeDayOfWeek(day?: string | null): DayOfWeek | null {
   if (!day) return null
   return DAY_MAP[day] || DAY_MAP[day.toLowerCase()] || null
}

export async function GET(req: NextRequest) {
   try {
      const parsed = parseQueryParams(req.url, scheduleListQuerySchema)
      if ('errorResponse' in parsed) {
         return parsed.errorResponse
      }

      const currentUser = await getCurrentUser()
      const { startDate, endDate } = parsed.data

      const andConditions: Prisma.LessonWhereInput[] = []

      if (
         currentUser &&
         currentUser.role === 'USER' &&
         Array.isArray(currentUser.groups) &&
         currentUser.groups.length > 0
      ) {
         andConditions.push({
            subject: { in: currentUser.groups },
         })
      }

      let dateFilter: { gte: Date; lte: Date } | undefined

      if (startDate && endDate) {
         const rangeStart = new Date(startDate)
         rangeStart.setUTCHours(0, 0, 0, 0)

         const rangeEnd = new Date(endDate)
         rangeEnd.setUTCHours(23, 59, 59, 999)

         dateFilter = { gte: rangeStart, lte: rangeEnd }

         andConditions.push({
            OR: [
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
            ],
         })
      }

      const whereClause: Prisma.LessonWhereInput =
         andConditions.length > 0 ? { AND: andConditions } : {}

      const relationsInclude: Prisma.LessonInclude = dateFilter
         ? {
              teacher: { select: { id: true, name: true, email: true } },
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
              teacher: { select: { id: true, name: true, email: true } },
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

   const rawDays =
      Array.isArray(daysOfWeek) && daysOfWeek.length > 0
         ? daysOfWeek
         : dayOfWeek
           ? [dayOfWeek]
           : []

   const normalizedDays: DayOfWeek[] = rawDays
      .map((d: string) => normalizeDayOfWeek(d))
      .filter((d): d is DayOfWeek => d !== null)

   const primaryDay: DayOfWeek | null =
      normalizedDays[0] || normalizeDayOfWeek(dayOfWeek)

   if (isRecurring) {
      if (normalizedDays.length === 0 || !startTime || !endTime || !date) {
         return NextResponse.json(
            { error: 'Укажите дату начала, дни недели и время' },
            { status: 400 },
         )
      }

      recurring = true

      const [y, m, d] = date.split('-').map(Number)
      const dayIndexMap: DayOfWeek[] = [
         DayOfWeek.SUNDAY,
         DayOfWeek.MONDAY,
         DayOfWeek.TUESDAY,
         DayOfWeek.WEDNESDAY,
         DayOfWeek.THURSDAY,
         DayOfWeek.FRIDAY,
         DayOfWeek.SATURDAY,
      ]
      const firstDayKey = dayIndexMap[new Date(y, m - 1, d).getDay()]

      const timeRecord = timeByDay as Record<
         string,
         { startTime?: string; endTime?: string }
      > | null

      const customSlot =
         timeRecord?.[firstDayKey] ||
         timeRecord?.[firstDayKey.toLowerCase()] ||
         timeRecord?.[firstDayKey.slice(0, 3).toLowerCase()]

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
      const cleanTeacherId =
         typeof teacherId === 'string' && teacherId.trim().length > 0
            ? teacherId.trim()
            : null

      const lesson = await prisma.lesson.create({
         data: {
            subject,
            teacherId: cleanTeacherId,
            customTeacherName: customTeacherName?.trim() || null,
            teacherByDay:
               teacherByDay && Object.keys(teacherByDay).length > 0
                  ? (teacherByDay as Prisma.InputJsonValue)
                  : Prisma.DbNull,
            timeByDay:
               timeByDay && Object.keys(timeByDay).length > 0
                  ? (timeByDay as Prisma.InputJsonValue)
                  : Prisma.DbNull,
            room: null,
            color: color || '#8BA888',
            totalLessons:
               recurring && totalLessons ? Number(totalLessons) : null,
            startsAt,
            endsAt,
            isRecurring: recurring,
            dayOfWeek: primaryDay,
            daysOfWeek: normalizedDays,
            createdBy: user.id,
         },
         include: {
            teacher: { select: { id: true, name: true, email: true } },
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
