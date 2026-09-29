import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, parseJsonBody, parseQueryParams } from '@/lib/apiGuard'
import {
   homeworkQuerySchema,
   saveHomeworkSchema,
} from '@/schemas/homework.schema'
import { deleteS3File } from '@/lib/s3'

export const GET = withAuth<{ id: string }>(
   ['ADMIN', 'TEACHER', 'USER'],
   async (req, { params }) => {
      const { id } = params
      const parsed = parseQueryParams(req.url, homeworkQuerySchema)
      if ('errorResponse' in parsed) {
         return parsed.errorResponse
      }

      const [y, m, d] = parsed.data.date.split('-').map(Number)
      const targetDate = new Date(Date.UTC(y, m - 1, d))

      const homework = await prisma.homework.findUnique({
         where: {
            lessonId_date: {
               lessonId: id,
               date: targetDate,
            },
         },
         include: {
            author: {
               select: {
                  id: true,
                  name: true,
               },
            },
         },
      })

      return NextResponse.json({ homework })
   },
)

export const PUT = withAuth<{ id: string }>(
   ['ADMIN', 'TEACHER'],
   async (req, { params, user }) => {
      const { id } = params
      const parsed = await parseJsonBody(req, saveHomeworkSchema)
      if ('errorResponse' in parsed) {
         return parsed.errorResponse
      }

      const { date, title, description, videoUrl, videoKey } = parsed.data
      const [y, m, d] = date.split('-').map(Number)
      const targetDate = new Date(Date.UTC(y, m - 1, d))

      const existing = await prisma.homework.findUnique({
         where: {
            lessonId_date: {
               lessonId: id,
               date: targetDate,
            },
         },
      })

      if (existing?.videoKey && videoKey && existing.videoKey !== videoKey) {
         try {
            await deleteS3File(existing.videoKey)
         } catch (error) {
            console.error(error)
         }
      }

      const homework = await prisma.homework.upsert({
         where: {
            lessonId_date: {
               lessonId: id,
               date: targetDate,
            },
         },
         create: {
            lessonId: id,
            date: targetDate,
            title: title || null,
            description,
            videoUrl: videoUrl || null,
            videoKey: videoKey || null,
            authorId: user.id,
         },
         update: {
            title: title || null,
            description,
            videoUrl: videoUrl || null,
            videoKey: videoKey || null,
            authorId: user.id,
         },
         include: {
            author: {
               select: {
                  id: true,
                  name: true,
               },
            },
         },
      })

      return NextResponse.json({ homework })
   },
)

export const DELETE = withAuth<{ id: string }>(
   ['ADMIN', 'TEACHER'],
   async (req, { params }) => {
      const { id } = params
      const parsed = parseQueryParams(req.url, homeworkQuerySchema)
      if ('errorResponse' in parsed) {
         return parsed.errorResponse
      }

      const [y, m, d] = parsed.data.date.split('-').map(Number)
      const targetDate = new Date(Date.UTC(y, m - 1, d))

      const existing = await prisma.homework.findUnique({
         where: {
            lessonId_date: {
               lessonId: id,
               date: targetDate,
            },
         },
      })

      if (!existing) {
         return NextResponse.json(
            { error: 'Домашнее задание не найдено' },
            { status: 404 },
         )
      }

      if (existing.videoKey) {
         try {
            await deleteS3File(existing.videoKey)
         } catch (error) {
            console.error(error)
         }
      }

      await prisma.homework.delete({
         where: {
            lessonId_date: {
               lessonId: id,
               date: targetDate,
            },
         },
      })

      return NextResponse.json({ success: true })
   },
)
