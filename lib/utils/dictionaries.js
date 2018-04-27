const formatDict = {
  'weight,count': { format: '«вес-повторения»', example: '50-8' },
  'count': { format: '«повторения»', example: '10' },
  'time': { format: '«минуты:секунды»', example: '2:30' }
}

const weekDaysDict = { 1: 'Пн', 2: 'Вт', 3: 'Ср', 4: 'Чт', 5: 'Пт', 6: 'Сб', 7: 'Вс' }

module.exports = {
  formatDict,
  weekDaysDict
}