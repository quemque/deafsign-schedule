import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { withAuth, parseJsonBody } from '@/lib/apiGuard'
import { presignedUploadSchema } from '@/schemas/homework.schema'
import { createPresignedUploadUrl } from '@/lib/s3'

export const POST = withAuth(['ADMIN', 'TEACHER'], async (req) => {
   const parsed = await parseJsonBody(req, presignedUploadSchema)
   if ('errorResponse' in parsed) {
      return parsed.errorResponse
   }

   const { fileName, fileType } = parsed.data
   const isImage = fileType.startsWith('image/')
   const folder = isImage ? 'homework/images' : 'homework/videos'
   const extension = fileName.split('.').pop() || (isImage ? 'jpg' : 'mp4')
   const uniqueKey = `${folder}/${Date.now()}-${crypto.randomUUID()}.${extension}`

   try {
      const { uploadUrl, publicUrl, key } = await createPresignedUploadUrl(
         uniqueKey,
         fileType,
      )
      return NextResponse.json({ uploadUrl, publicUrl, key })
   } catch (error) {
      console.error(error)
      return NextResponse.json(
         { error: 'Сбой генерации ссылки хранилища' },
         { status: 500 },
      )
   }
})
