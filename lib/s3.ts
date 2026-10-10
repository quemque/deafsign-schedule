import {
   S3Client,
   PutObjectCommand,
   DeleteObjectCommand,
   GetObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export const s3Client = new S3Client({
   region: process.env.YC_REGION || 'ru-central1',
   endpoint: process.env.YC_ENDPOINT || 'https://storage.yandexcloud.net',
   credentials: {
      accessKeyId: process.env.YC_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.YC_SECRET_ACCESS_KEY || '',
   },
})

const BUCKET_NAME = process.env.YC_BUCKET_NAME || ''

export async function createPresignedUploadUrl(
   key: string,
   contentType: string,
) {
   const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
   })

   const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
   const endpoint = process.env.YC_ENDPOINT || 'https://storage.yandexcloud.net'
   const publicUrl = `${endpoint}/${BUCKET_NAME}/${key}`

   return { uploadUrl, publicUrl, key }
}

export async function createPresignedDownloadUrl(key: string): Promise<string> {
   if (!key || !BUCKET_NAME) return ''

   const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
   })

   return getSignedUrl(s3Client, command, { expiresIn: 3600 })
}

export async function deleteS3File(key: string) {
   if (!key || !BUCKET_NAME) return
   const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
   })
   await s3Client.send(command)
}
