import type { Metadata } from 'next'
import { QueryProvider } from '@/providers/QueryProvider'
import './globals.css'

export const metadata: Metadata = {
   title: 'DeafSign Schedule',
   description: 'Система управления расписанием занятий',
}

export default function RootLayout({
   children,
}: {
   children: React.ReactNode
}) {
   return (
      <html lang="ru">
         <body>
            <QueryProvider>{children}</QueryProvider>
         </body>
      </html>
   )
}
