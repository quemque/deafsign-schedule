'use client'

import { Mail } from 'lucide-react'

interface SubmitHomeworkButtonProps {
   href: string
}

export function SubmitHomeworkButton({ href }: SubmitHomeworkButtonProps) {
   return (
      <a
         href={href}
         target="_blank"
         rel="noopener noreferrer"
         className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#8BA888] text-white hover:bg-[#7A9A77] active:scale-[0.98] transition-all shadow-2xs"
      >
         <Mail className="w-4 h-4" />
         <span>Отправить ДЗ на проверку</span>
      </a>
   )
}
