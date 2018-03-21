const moment = require('moment')

const regWeightCount = new RegExp(/^([0-9]{1,3}([.,][0-9])?([-–—])([0-9]{1,3}))$/g),
  regCount = new RegExp(/^([0-9]{1,3})$/g),
  regTime = new RegExp(/^([0-9]{1,3}):[0-5][0-9]$/g)

  /**
 * Make a string from last results
 * @param {Array} lastResults array of last results
 * @param {String} format format of the exercise
 */
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
  lastResultsToString,
  regWeightCount,
  regCount,
  regTime
}