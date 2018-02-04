const Scene = require('telegraf/scenes/base')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const moment = require('moment')
const userDb = require('../db/controllers/user.controller')

const repeatsScene = new Scene('repeats')

const enterKeyboard = ['🔙 Сменить упражнение', '🔚 Завершить тренировку']

const errorMessage = 'Неправильный формат ввода'

const dict = {
  'weight,count': {format: '«вес-повторения»', example: '50-8'},
  'count': {format: '«повторения»', example: '10'},
  'time': {format: '«минуты:секунды»', example: '2:30'}
}

repeatsScene.enter(ctx => {
  const format = ctx.session.exercise.format

  const enterMessage = `Отправляй подходы в формате ${dict[format].format}`

  userDb.getLastResults(ctx.from.id, ctx.session.exercise.name)
    .then(res => {
      if (!res)
        return ctx.reply(enterMessage, Markup.keyboard(enterKeyboard).extra())

      let previousWorkout = `<b>Предыдущие показатели</b>
Дата: ${moment(res.dateStart).format('DD.MM.YYYY')}
Количество подходов: ${res.repeats.length}
Повторения: `

      if (format === 'weight,count')
        res.repeats.forEach(r => {
          previousWorkout = previousWorkout.concat(`${r.weight}x${r.count}, `)
        })
      else if (format === 'count')
        res.repeats.forEach(r => {
          previousWorkout = previousWorkout.concat(`${r.count}, `)
        })
      else
        res.repeats.forEach(r => {
          const minutes = Math.floor(r.time / 60)
          const seconds = r.time % 60
          previousWorkout = previousWorkout.concat(`${minutes}:${(seconds < 10 ? '0' : '') + seconds}, `)
        })

      previousWorkout = previousWorkout.replace(/,\s*$/, '')

      let message = previousWorkout + '\n\n' + enterMessage

      ctx.replyWithHTML(message, Markup.keyboard(enterKeyboard).extra())
    })
})

const regWeightCount = new RegExp(/^(([0-9]{1,3})([-–—])([0-9]{1,3}))$/g)
const regCount = new RegExp(/^([0-9]{1,3})$/g)
const regTime = new RegExp(/^(([0-9]{1,3})([:])([0-9]{1,3}))$/g)

repeatsScene.hears(regWeightCount, ctx => {
  const format = ctx.session.exercise.format
  const repeat = ctx.message.text

  if (format === 'weight,count') {
    const data = repeat.split(/[-–—]/)
    ctx.session.exercise.repeats.push({ weight: data[0], count: data[1] })
    return ctx.reply('✔')
  }
  else return ctx.reply(errorMessage + `. Например ${dict[ctx.session.exercise.format].example}`)
})

repeatsScene.hears(regCount, ctx => {
  const format = ctx.session.exercise.format
  const repeat = ctx.message.text

  if (format === 'count') {
    ctx.session.exercise.repeats.push({ count: repeat })
    return ctx.reply('✔')
  }
  else return ctx.reply(errorMessage + `. Например ${dict[ctx.session.exercise.format].example}`)
})

repeatsScene.hears(regTime, ctx => {
  const format = ctx.session.exercise.format
  const repeat = ctx.message.text

  if (format === 'time') {
    const data = repeat.split(/[:]/)
    ctx.session.exercise.repeats.push({ time: parseInt(data[0]) * 60 + parseInt(data[1]) })
    return ctx.reply('✔')
  }
  else return ctx.reply(errorMessage + `. Например ${dict[ctx.session.exercise.format].example}`)
})

repeatsScene.hears(/Сменить упражнение/gi, ctx => {
  submitRepeats(ctx)
    .then(() => {
      ctx.scene.enter('exercises')
    })
})

repeatsScene.hears(/Завершить тренировку/gi, ctx => {
  submitRepeats(ctx)
  .then(() => {
    if (Object.keys(ctx.session.train.exercises).length > 0) {
      ctx.session.train.dateEnd = moment().format()
      userDb.addTrain(ctx.from.id, ctx.session.train)
      ctx.session.hasDiary = true      
    }
    ctx.session.train = {}
    ctx.session.exercise = {}
    ctx.scene.enter('rest')
  })
})

repeatsScene.on('text', ctx => ctx.reply(errorMessage + `. Например ${dict[ctx.session.exercise.format].example}`))

/**
 * Write repeats in relevant exercise of the train, and clear current temp exercise.
 * @param {Object} ctx - user's context
 * @return {Promise} empty, but ctx is updated
 */
let submitRepeats = function (ctx) {
  const exercise = ctx.session.exercise

  if (exercise.repeats.length === 0)
    return Promise.resolve()

  if (ctx.session.train.exercises[exercise.name])
    exercise.repeats.forEach(r => ctx.session.train.exercises[exercise.name].repeats.push(r))
  else {
    ctx.session.train.exercises[exercise.name] = {}
    ctx.session.train.exercises[exercise.name].group = exercise.group
    ctx.session.train.exercises[exercise.name].format = exercise.format
    ctx.session.train.exercises[exercise.name].repeats = []

    exercise.repeats.forEach(r => ctx.session.train.exercises[exercise.name].repeats.push(r))
  }

  ctx.session.exercise.name = ''
  ctx.session.exercise.format = ''
  ctx.session.exercise.repeats = []

  return Promise.resolve()
}

module.exports = repeatsScene