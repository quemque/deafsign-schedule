export const getCurrentTimePosition = (currentTime: Date) => {
   const hours = currentTime.getHours()
   const minutes = currentTime.getMinutes()
   const totalMinutes = hours * 60 + minutes
   const startMinutesFrom8 = totalMinutes - 8 * 60
   return (startMinutesFrom8 / 60) * 96
}

export const getCurrentDayName = (currentTime: Date) => {
   const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
   return days[currentTime.getDay()]
}
