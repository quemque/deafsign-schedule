export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { DayOfWeek } from '@prisma/client'

export async function GET() {
   try {
      const lessons = await prisma.lesson.findMany({
         orderBy: { startsAt: 'asc' },
         include: {
            teacher: { select: { id: true, name: true } },
            comments: true,
            cancellations: true,
            overrides: true,
            reschedules: true,
         },
      })
      return NextResponse.json({ lessons })
   } catch (error) {
      return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
   }
}

export async function POST(req: NextRequest) {
   try {
      const user = await getCurrentUser()

      if (!user || user.role !== 'ADMIN') {
         return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
      }

      const body = await req.json()
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
      } = body

      if (!subject) {
         return NextResponse.json(
            { error: 'Заполните предмет' },
            { status: 400 },
         )
      }

      let startsAt: Date
      let endsAt: Date
      let recurring = false
      let resolvedDaysOfWeek: DayOfWeek[] = []
      let resolvedDayOfWeek: DayOfWeek | null = null

      if (isRecurring) {
         const selectedDays =
            Array.isArray(daysOfWeek) && daysOfWeek.length > 0
               ? (daysOfWeek as DayOfWeek[])
               : dayOfWeek
                 ? [dayOfWeek as DayOfWeek]
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

         const activeStartTime = customSlot?.startTime?.trim()
            ? customSlot.startTime
            : startTime
         const activeEndTime = customSlot?.endTime?.trim()
            ? customSlot.endTime
            : endTime

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
            { error: 'Укажите дату и время' },
            { status: 400 },
         )
      }

      const lesson = await prisma.lesson.create({
         data: {
            subject,
            teacherId: teacherId || null,
            customTeacherName: customTeacherName
               ? customTeacherName.trim()
               : null,
            teacherByDay: teacherByDay || null,
            timeByDay: timeByDay || null,
            room: null,
            color: color || '#8BA888',
            totalLessons:
               recurring && totalLessons ? Number(totalLessons) : null,
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

      return NextResponse.json({ lesson })
   } catch (error) {
      console.error(error)
      return NextResponse.json(
         { error: 'Ошибка при создании занятия' },
         { status: 500 },
      )
   }
}
