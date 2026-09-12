import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function PATCH(
   req: NextRequest,
   { params }: { params: { id: string } },
) {
   const user = await getCurrentUser()
   if (!user || (user.role !== 'ADMIN' && user.role !== 'TEACHER')) {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
   }

   const body = await req.json()

   if (user.role === 'TEACHER') {
      const lesson = await prisma.lesson.update({
         where: { id: params.id },
         data: { comment: body.comment ?? null },
         include: { teacher: { select: { id: true, name: true } } },
      })
      return NextResponse.json({ lesson })
   }

   const lesson = await prisma.lesson.update({
      where: { id: params.id },
      data: {
         subject: body.subject,
         teacherId: body.teacherId || null,
         room: body.room ?? null,
         startsAt: body.startsAt ? new Date(body.startsAt) : undefined,
         endsAt: body.endsAt ? new Date(body.endsAt) : undefined,
         comment: body.comment ?? null,
      },
      include: { teacher: { select: { id: true, name: true } } },
   })

   return NextResponse.json({ lesson })
}

export async function DELETE(
   _req: NextRequest,
   { params }: { params: { id: string } },
) {
   const user = await getCurrentUser()
   if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
   }

   await prisma.lesson.delete({ where: { id: params.id } })
   return NextResponse.json({ ok: true })
}
