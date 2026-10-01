import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { withAuth, parseJsonBody, parseQueryParams } from '@/lib/apiGuard'
import {
   homeworkQuerySchema,
   deleteHomeworkQuerySchema,
   createHomeworkSchema,
   updateHomeworkSchema,
} from '@/schemas/homework.schema'
import { deleteS3File } from '@/lib/s3'
import type { HomeworkMediaItem } from '@/types/schedule'

export const GET = withAuth<{ id: string }>(
   ['ADMIN', 'TEACHER', 'USER'],
   async (req, { params, user }) => {
      const { id } = params
      const parsed = parseQueryParams(req.url, homeworkQuerySchema)
      if ('errorResponse' in parsed) {
         return parsed.errorResponse
      }

      const [y, m, d] = parsed.data.date.split('-').map(Number)
      const targetDate = new Date(Date.UTC(y, m - 1, d))

      const rawHomeworks = await prisma.homework.findMany({
         where: {
            lessonId: id,
            date: targetDate,
         },
         orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
         include: {
            author: {
               select: {
                  id: true,
                  name: true,
               },
            },
         },
      })

      const now = new Date()
      const isPrivileged = user.role === 'ADMIN' || user.role === 'TEACHER'

      const homeworks = rawHomeworks.map((hw) => {
         const isLocked =
            !isPrivileged && hw.unlockDate && new Date(hw.unlockDate) > now

         let resolvedMedia: HomeworkMediaItem[] = []
         if (Array.isArray(hw.videos)) {
            resolvedMedia = (hw.videos as unknown as HomeworkMediaItem[]).map(
               (item) => ({
                  ...item,
                  type: item.type || 'video',
               }),
            )
         } else if (hw.videoUrl) {
            resolvedMedia = [
               {
                  id: 'legacy-1',
                  type: 'video',
                  url: hw.videoUrl,
                  key: hw.videoKey || '',
                  title: 'Видеоматериал',
               },
            ]
         }

         if (isLocked) {
            return {
               id: hw.id,
               lessonId: hw.lessonId,
               date: hw.date,
               title: hw.title,
               description: 'Задание станет доступно позже',
               videoUrl: null,
               videoKey: null,
               videos: [],
               order: hw.order,
               unlockDate: hw.unlockDate,
               authorId: hw.authorId,
               author: hw.author,
               createdAt: hw.createdAt,
               updatedAt: hw.updatedAt,
               isLocked: true,
            }
         }

         return {
            ...hw,
            videos: resolvedMedia,
            isLocked: false,
         }
      })

      return NextResponse.json({ homeworks })
   },
)

export const POST = withAuth<{ id: string }>(
   ['ADMIN', 'TEACHER'],
   async (req, { params, user }) => {
      const { id } = params
      const parsed = await parseJsonBody(req, createHomeworkSchema)
      if ('errorResponse' in parsed) {
         return parsed.errorResponse
      }

      const {
         date,
         title,
         description,
         videoUrl,
         videoKey,
         videos,
         unlockDate,
         order,
      } = parsed.data

      const [y, m, d] = date.split('-').map(Number)
      const targetDate = new Date(Date.UTC(y, m - 1, d))
      const resolvedUnlockDate = unlockDate ? new Date(unlockDate) : null

      const count = await prisma.homework.count({
         where: {
            lessonId: id,
            date: targetDate,
         },
      })

      const resolvedMedia: HomeworkMediaItem[] =
         videos && videos.length > 0
            ? (videos as HomeworkMediaItem[])
            : videoUrl
              ? [
                   {
                      id: '1',
                      type: 'video',
                      url: videoUrl,
                      key: videoKey || '',
                      title: 'Видео',
                   },
                ]
              : []

      const firstVideo = resolvedMedia.find((m) => m.type === 'video')

      const homework = await prisma.homework.create({
         data: {
            lessonId: id,
            date: targetDate,
            title: title || null,
            description,
            videoUrl: firstVideo?.url || videoUrl || null,
            videoKey: firstVideo?.key || videoKey || null,
            videos:
               resolvedMedia.length > 0
                  ? (resolvedMedia as unknown as Prisma.InputJsonValue)
                  : Prisma.JsonNull,
            unlockDate: resolvedUnlockDate,
            order: order ?? count,
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

      return NextResponse.json({ homework }, { status: 201 })
   },
)

export const PUT = withAuth<{ id: string }>(
   ['ADMIN', 'TEACHER'],
   async (req, { params }) => {
      const { id } = params
      const parsed = await parseJsonBody(req, updateHomeworkSchema)
      if ('errorResponse' in parsed) {
         return parsed.errorResponse
      }

      const {
         id: homeworkId,
         title,
         description,
         videoUrl,
         videoKey,
         videos,
         unlockDate,
         order,
      } = parsed.data

      const existing = await prisma.homework.findFirst({
         where: {
            id: homeworkId,
            lessonId: id,
         },
      })

      if (!existing) {
         return NextResponse.json(
            { error: 'Задание не найдено' },
            { status: 404 },
         )
      }

      const existingMedia = (Array.isArray(existing.videos)
         ? existing.videos
         : []) as unknown as HomeworkMediaItem[]

      const newMedia: HomeworkMediaItem[] =
         videos && videos.length > 0
            ? (videos as HomeworkMediaItem[])
            : videoUrl
              ? [
                   {
                      id: '1',
                      type: 'video',
                      url: videoUrl,
                      key: videoKey || '',
                      title: 'Видео',
                   },
                ]
              : []

      const newKeys = new Set(newMedia.map((v) => v.key))
      for (const oldItem of existingMedia) {
         if (oldItem.key && !newKeys.has(oldItem.key)) {
            try {
               await deleteS3File(oldItem.key)
            } catch (err) {
               console.error(err)
            }
         }
      }

      const firstVideo = newMedia.find((m) => m.type === 'video')

      const homework = await prisma.homework.update({
         where: { id: homeworkId },
         data: {
            title: title || null,
            description,
            videoUrl: firstVideo?.url || videoUrl || null,
            videoKey: firstVideo?.key || videoKey || null,
            videos:
               newMedia.length > 0
                  ? (newMedia as unknown as Prisma.InputJsonValue)
                  : Prisma.JsonNull,
            unlockDate: unlockDate ? new Date(unlockDate) : null,
            order: order ?? existing.order,
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
      const parsed = parseQueryParams(req.url, deleteHomeworkQuerySchema)
      if ('errorResponse' in parsed) {
         return parsed.errorResponse
      }

      const { homeworkId } = parsed.data

      const existing = await prisma.homework.findFirst({
         where: {
            id: homeworkId,
            lessonId: id,
         },
      })

      if (!existing) {
         return NextResponse.json(
            { error: 'Задание не найдено' },
            { status: 404 },
         )
      }

      const existingMedia = (Array.isArray(existing.videos)
         ? existing.videos
         : []) as unknown as HomeworkMediaItem[]

      for (const item of existingMedia) {
         if (item.key) {
            try {
               await deleteS3File(item.key)
            } catch (err) {
               console.error(err)
            }
         }
      }

      if (existing.videoKey) {
         try {
            await deleteS3File(existing.videoKey)
         } catch (err) {
            console.error(err)
         }
      }

      await prisma.homework.delete({
         where: { id: homeworkId },
      })

      return NextResponse.json({ success: true })
   },
)
