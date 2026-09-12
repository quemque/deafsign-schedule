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
         room,
         isRecurring,
         date,
         dayOfWeek,
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
      let resolvedDayOfWeek: DayOfWeek | null = null

      if (isRecurring) {
         if (!dayOfWeek || !startTime || !endTime) {
            return NextResponse.json(
               { error: 'Укажите день недели и время' },
               { status: 400 },
            )
         }

         recurring = true
         resolvedDayOfWeek = dayOfWeek as DayOfWeek

         const dayMap: Record<string, number> = {
            SUNDAY: 0,
            MONDAY: 1,
            TUESDAY: 2,
            WEDNESDAY: 3,
            THURSDAY: 4,
            FRIDAY: 5,
            SATURDAY: 6,
         }

         const anchor = new Date(Date.UTC(2026, 0, 4))
         const offset = dayMap[dayOfWeek] - anchor.getUTCDay()
         anchor.setUTCDate(anchor.getUTCDate() + offset)

         const [sh, sm] = startTime.split(':').map(Number)
         const [eh, em] = endTime.split(':').map(Number)

         startsAt = new Date(anchor)
         startsAt.setUTCHours(sh, sm, 0, 0)

         endsAt = new Date(anchor)
         endsAt.setUTCHours(eh, em, 0, 0)
      } else if (rawStartsAt && rawEndsAt) {
         startsAt = new Date(rawStartsAt)
         endsAt = new Date(rawEndsAt)
      } else if (date && startTime && endTime) {
         startsAt = new Date(`${date}T${startTime}:00`)
         endsAt = new Date(`${date}T${endTime}:00`)
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
            room: room || null,
            startsAt,
            endsAt,
            isRecurring: recurring,
            dayOfWeek: resolvedDayOfWeek,
            createdBy: user.id,
         },
         include: {
            teacher: { select: { id: true, name: true } },
            comments: true,
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
