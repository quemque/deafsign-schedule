export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/apiGuard'

export const GET = withAuth(['ADMIN'], async () => {
   const lessons = await prisma.lesson.findMany({
      select: { subject: true },
      distinct: ['subject'],
      orderBy: { subject: 'asc' },
   })

   const users = await prisma.user.findMany({
      select: { groups: true },
   })

   const fromLessons = lessons.map((l) => l.subject.trim())
   const fromUsers = users.flatMap((u) => u.groups || []).map((g) => g.trim())

   const uniqueGroups = Array.from(new Set([...fromLessons, ...fromUsers]))
      .filter((g) => g.length > 0)
      .sort((a, b) => a.localeCompare(b, 'ru'))

   return NextResponse.json({ groups: uniqueGroups })
})
