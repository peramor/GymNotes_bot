const Scene = require('telegraf/scenes/base')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const moment = require('moment')
const userDb = require('../db/controllers/user.controller')
const { isForgetful, endTrain } = require('../utils/session-manager')
const FormatException = require('../exceptions/format-exception')

const repeatsScene = new Scene('repeats')
const enterKeyboard = ['🔙 Сменить упражнение', '🔚 Завершить тренировку']

const dict = {
  'weight,count': { format: '«вес-повторения»', example: '50-8' },
  'count': { format: '«повторения»', example: '10' },
  'time': { format: '«минуты:секунды»', example: '2:30' }
}

repeatsScene.enter(async ctx => {
  const format = ctx.session.exercise.format

  const enterMessage = `Отправляй подходы в формате ${dict[format].format}`

  let lastResults = await userDb.getLastResults(ctx.from.id, ctx.session.exercise.name)
  if (!lastResults)
    return ctx.reply(enterMessage, Markup.keyboard(enterKeyboard).extra())

  let previousWorkout = `<b>Предыдущие показатели</b>
  Дата: ${moment(lastResults.date).format('DD.MM.YYYY')}
  Количество подходов: ${lastResults.repeats.length}
  Повторения: `

  if (format === 'weight,count')
    lastResults.repeats.forEach(r => {
      previousWorkout = previousWorkout.concat(`${r.weight}x${r.count}, `)
    })
  else if (format === 'count')
    lastResults.repeats.forEach(r => {
      previousWorkout = previousWorkout.concat(`${r.count}, `)
    })
  else
    lastResults.repeats.forEach(r => {
      const minutes = Math.floor(r.time / 60)
      const seconds = r.time % 60
      previousWorkout = previousWorkout.concat(`${minutes}:${(seconds < 10 ? '0' : '') + seconds}, `)
    })

  previousWorkout = previousWorkout.replace(/,\s*$/, '')

  let message = previousWorkout + '\n\n' + enterMessage

  ctx.replyWithHTML(message, Markup.keyboard(enterKeyboard).extra())
})

repeatsScene.on('text', async (ctx, next) => {
  if (isForgetful(ctx)) {
    submitRepeats(ctx)
    await ctx.reply('Предыдущая тренировка была завершена автоматически')
    await endTrain(ctx)
  }
  ctx.session.train.lastMessageDate = moment(ctx.message.date, 'X').format()
  await next()
})

const regWeightCount = new RegExp(/^([0-9]{1,3}([.,][0-9])?([-–—])([0-9]{1,3}))$/g)
const regCount = new RegExp(/^([0-9]{1,3})$/g)
const regTime = new RegExp(/^([0-9]{1,3}):[0-5][0-9]$/g)

repeatsScene.hears(regWeightCount, ctx => {
  const format = ctx.session.exercise.format
  const repeat = ctx.message.text

  if (format === 'weight,count') {
    const data = repeat.split(/[-–—]/)
    ctx.session.exercise.repeats.push({ weight: Number(data[0].replace(',', '.')), count: data[1] })

    return ctx.reply('✔')
  } else {
    throw new FormatException(ctx)
  }
})

repeatsScene.hears(regCount, ctx => {
  const format = ctx.session.exercise.format
  const repeat = ctx.message.text

  if (format === 'count') {
    ctx.session.exercise.repeats.push({ count: repeat })

    return ctx.reply('✔')
  } else {
    throw new FormatException(ctx)
  }
})

repeatsScene.hears(regTime, ctx => {
  const format = ctx.session.exercise.format
  const repeat = ctx.message.text

  if (format === 'time') {
    const data = repeat.split(/[:]/)
    ctx.session.exercise.repeats.push({ time: parseInt(data[0]) * 60 + parseInt(data[1]) })

    return ctx.reply('✔')
  } else {
    throw FormatException(ctx)
  }
})

repeatsScene.hears(/Сменить упражнение/gi, ctx => {
  submitRepeats(ctx)
  return ctx.scene.enter('exercises')
})

repeatsScene.hears(/Завершить тренировку/gi, async ctx => {
  submitRepeats(ctx)
  ctx.session.exercise = {}
  await endTrain(ctx)
})

repeatsScene.on('text', ctx => {
  throw new FormatException(ctx)
})

/**
 * Write repeats in relevant exercise of the train, and clear current temp exercise.
 * @param {Object} ctx - user's context
 */
let submitRepeats = function (ctx) {
  const exercise = ctx.session.exercise

  if (exercise.repeats.length === 0)
    return

  let repeatedExercise = ctx.session.train.exercises.find(e => e.name === exercise.name)
  if (repeatedExercise)
    exercise.repeats.forEach(r => repeatedExercise.repeats.push(r))
  else {
    let exerciseObj = {
      name: exercise.name,
      group: exercise.group,
      format: exercise.format,
      repeats: []
    }
    exercise.repeats.forEach(r => exerciseObj.repeats.push(r))

    ctx.session.train.exercises.push(exerciseObj)
  }

  ctx.session.exercise.name = ''
  ctx.session.exercise.format = ''
  ctx.session.exercise.repeats = []
}

module.exports = repeatsScene