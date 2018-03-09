const moment = require('moment')

const dict = {
  'weight,count': { format: '«вес-повторения»', example: '50-8' },
  'count': { format: '«повторения»', example: '10' },
  'time': { format: '«минуты:секунды»', example: '2:30' }
}

const regWeightCount = new RegExp(/^([0-9]{1,3}([.,][0-9])?([-–—])([0-9]{1,3}))$/g),
  regCount = new RegExp(/^([0-9]{1,3})$/g),
  regTime = new RegExp(/^([0-9]{1,3}):[0-5][0-9]$/g)

const lastResultsToString = function (lastResults, format) {
  let message = `<b>Предыдущие показатели</b>
Дата: ${moment(lastResults.date).format('DD.MM.YYYY')}
Количество подходов: ${lastResults.repeats.length}
Повторения: `

  if (format === 'weight,count')
    lastResults.repeats.forEach(r => {
      message = message.concat(`${r.weight}x${r.count}, `)
    })
  else if (format === 'count')
    lastResults.repeats.forEach(r => {
      message = message.concat(`${r.count}, `)
    })
  else
    lastResults.repeats.forEach(r => {
      const minutes = Math.floor(r.time / 60)
      const seconds = r.time % 60
      message = message.concat(`${minutes}:${(seconds < 10 ? '0' : '') + seconds}, `)
    })

  return message.replace(/,\s*$/, '')
}

module.exports = {
  dict,
  lastResultsToString,
  regWeightCount,
  regCount,
  regTime
}