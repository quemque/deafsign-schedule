import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, parseJsonBody, parseQueryParams } from '@/lib/apiGuard'
import {
   homeworkQuerySchema,
   deleteHomeworkQuerySchema,
   createHomeworkSchema,
   updateHomeworkSchema,
} from '@/schemas/homework.schema'
import { deleteS3File } from '@/lib/s3'
import type { HomeworkVideoItem } from '@/types/schedule'

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

         let resolvedVideos: HomeworkVideoItem[] = []
         if (Array.isArray(hw.videos)) {
            resolvedVideos = hw.videos as unknown as HomeworkVideoItem[]
         } else if (hw.videoUrl) {
            resolvedVideos = [
               {
                  id: 'legacy-1',
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
            videos: resolvedVideos,
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

      const resolvedVideos =
         videos && videos.length > 0
            ? videos
            : videoUrl
              ? [
                   {
                      id: '1',
                      url: videoUrl,
                      key: videoKey || '',
                      title: 'Видео',
                   },
                ]
              : []

      const homework = await prisma.homework.create({
         data: {
            lessonId: id,
            date: targetDate,
            title: title || null,
            description,
            videoUrl: resolvedVideos[0]?.url || videoUrl || null,
            videoKey: resolvedVideos[0]?.key || videoKey || null,
            videos: resolvedVideos as any,
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

      const existingVideos = (Array.isArray(existing.videos)
         ? existing.videos
         : []) as unknown as HomeworkVideoItem[]

      const newVideos =
         videos && videos.length > 0
            ? videos
            : videoUrl
              ? [
                   {
                      id: '1',
                      url: videoUrl,
                      key: videoKey || '',
                      title: 'Видео',
                   },
                ]
              : []

      const newKeys = new Set(newVideos.map((v) => v.key))
      for (const oldV of existingVideos) {
         if (oldV.key && !newKeys.has(oldV.key)) {
            try {
               await deleteS3File(oldV.key)
            } catch (err) {
               console.error(err)
            }
         }
      }

      if (
         existing.videoKey &&
         !newKeys.has(existing.videoKey) &&
         videoKey !== existing.videoKey
      ) {
         try {
            await deleteS3File(existing.videoKey)
         } catch (err) {
            console.error(err)
         }
      }

      const homework = await prisma.homework.update({
         where: { id: homeworkId },
         data: {
            title: title || null,
            description,
            videoUrl: newVideos[0]?.url || videoUrl || null,
            videoKey: newVideos[0]?.key || videoKey || null,
            videos: newVideos as any,
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

      const existingVideos = (Array.isArray(existing.videos)
         ? existing.videos
         : []) as unknown as HomeworkVideoItem[]

      for (const v of existingVideos) {
         if (v.key) {
            try {
               await deleteS3File(v.key)
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
