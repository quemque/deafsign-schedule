const RECIPIENT_EMAIL = 'deafsign@deafsign.ru'

interface HomeworkEmailContext {
   lessonSubject: string
   lessonDate: string
}

export function createHomeworkMailtoUrl({
   lessonSubject,
   lessonDate,
}: HomeworkEmailContext): string {
   const subject = `[ДЗ] ${lessonSubject} — ${lessonDate}`

   const bodyLines = [
      'Здравствуйте!',
      '',
      'Прикрепляю выполненное домашнее задание.',
      '',
      `Предмет: ${lessonSubject}`,
      `Дата занятия: ${lessonDate}`,
      'Имя и Фамилия: ',
      'Группа: ',
   ]

   const searchParams = new URLSearchParams({
      subject,
      body: bodyLines.join('\n'),
   })

   const queryString = searchParams.toString().replace(/\+/g, '%20')
   return `mailto:${RECIPIENT_EMAIL}?${queryString}`
}
