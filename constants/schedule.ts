export const monthNames = [
   'января',
   'февраля',
   'марта',
   'апреля',
   'мая',
   'июня',
   'июля',
   'августа',
   'сентября',
   'октября',
   'ноября',
   'декабря',
]

export const DAYS_OF_WEEK = [
   { key: 'MONDAY', label: 'Понедельник', short: 'ПН' },
   { key: 'TUESDAY', label: 'Вторник', short: 'ВТ' },
   { key: 'WEDNESDAY', label: 'Среда', short: 'СР' },
   { key: 'THURSDAY', label: 'Четверг', short: 'ЧТ' },
   { key: 'FRIDAY', label: 'Пятница', short: 'ПТ' },
   { key: 'SATURDAY', label: 'Суббота', short: 'СБ' },
   { key: 'SUNDAY', label: 'Воскресенье', short: 'ВС' },
]

export const TIME_SLOTS = [
   '08:00',
   '09:00',
   '10:00',
   '11:00',
   '12:00',
   '13:00',
   '14:00',
   '15:00',
   '16:00',
   '17:00',
   '18:00',
   '19:00',
   '20:00',
   '21:00',
   '22:00',
]

export const LESSON_COLORS = [
   { label: 'Мятный', value: '#8BA888' },
   { label: 'Коралловый', value: '#E07A5F' },
   { label: 'Синий', value: '#457B9D' },
   { label: 'Охра', value: '#D4A373' },
   { label: 'Фиолетовый', value: '#9B5DE5' },
   { label: 'Графитовый', value: '#6C757D' },
]

export const INITIAL_FORM = {
   subject: '',
   comment: '',
   date: '',
   dayOfWeek: 'MONDAY',
   daysOfWeek: ['MONDAY'],
   startTime: '09:00',
   endTime: '10:30',
   room: '',
   teacherId: '',
   customTeacherName: '',
   teacherByDay: {},
   timeByDay: {},
   color: '#8BA888',
   totalLessons: '',
}
export const INDEX_TO_DAY = [
   'SUNDAY',
   'MONDAY',
   'TUESDAY',
   'WEDNESDAY',
   'THURSDAY',
   'FRIDAY',
   'SATURDAY',
]
export const DAY_INDICES: Record<string, number> = {
   SUNDAY: 0,
   MONDAY: 1,
   TUESDAY: 2,
   WEDNESDAY: 3,
   THURSDAY: 4,
   FRIDAY: 5,
   SATURDAY: 6,
}
