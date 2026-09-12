import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
   const email = 'admin@deafsign.ru'
   const login = 'admin'
   const password = 'admin123456'

   const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { login }] },
   })

   if (existing) {
      console.log('Админ уже существует')
      return
   }

   const passwordHash = await bcrypt.hash(password, 10)

   const admin = await prisma.user.create({
      data: {
         email,
         login,
         passwordHash,
         name: 'Главный администратор',
         role: 'ADMIN',
      },
   })

   console.log('Админ создан:', admin.login, '/', password)
}

main()
   .catch(console.error)
   .finally(() => prisma.$disconnect())
