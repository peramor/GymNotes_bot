const Scene = require('telegraf/scenes/base')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const moment = require('moment')
const userDb = require('../db/controllers/user.controller')

const repeatsScene = new Scene('repeats')

const enterKeyboard = ['Завершить упражнение']

repeatsScene.enter(ctx => {
  let enterMessage = 'Отправляй подходы в формате '

  const format = ctx.session.exercise.format

  switch (format) {
    case 'weight,count':
      enterMessage = enterMessage.concat('«повторения-вес»')
      break
    case 'count':
      enterMessage = enterMessage.concat('«повторения»')
      break
    case 'time':
      enterMessage = 'Отправляй подходы в любом формате'
      break
  }

  userDb.getLastResults(ctx.from.id, ctx.session.exercise.name)
    .then(res => {
      if (!res) return ctx.reply(enterMessage, Extra.markup(Markup.keyboard(enterKeyboard)))

      let previousWorkout = `<b>Предыдущие показатели</b>\nДата: ${moment(res.dateStart).format('DD.MM.YYYY')}\nКоличество подходов: ${res.repeats.length}\nПовторения: `

      if (format === 'weight,count')
        res.repeats.forEach(r => {
          previousWorkout = previousWorkout.concat(`${r.count}x${r.weight} `)
        })
      else if (format === 'count')
        res.repeats.forEach(r => {
          previousWorkout = previousWorkout.concat(`${r.count} `)
        })
      else
        res.repeats.forEach(r => {
          previousWorkout = previousWorkout.concat(`${r.time} `)
        })

      ctx.replyWithHTML(previousWorkout)
        .then(ctx.reply(enterMessage, Extra.markup(Markup.keyboard(enterKeyboard))))      
    })
})

const regWeightCount = new RegExp(/^(([0-9]{1,3})([-–—])([0-9]{1,3}))$/g)
const regCount = new RegExp(/^([0-9]{1,3})$/g)

repeatsScene.on('message', ctx => {
  if (ctx.message.text === 'Завершить упражнение') {
    if (ctx.session.exercise.repeats.length > 0) {
      ctx.session.train.exercises.push({
        repeats: ctx.session.exercise.repeats,
        name: ctx.session.exercise.name,
        group: ctx.session.exercise.group,
        format: ctx.session.exercise.format
      })

      ctx.session.exercise.repeats = []
    }

    ctx.session.exercise.name = ""

    return ctx.scene.enter('exercises')
  }

  const repeat = ctx.message.text
  const format = ctx.session.exercise.format
  const errorMessage = 'Неверный формат ввода'
  
  if (format === 'time') {
    ctx.session.exercise.repeats.push({ time: ctx.message.text })
    return ctx.reply('✔')
  }

  else if (repeat.match(regWeightCount)) {
    if (format === 'weight,count') {
      const data = repeat.split(/[-–—]/)
      ctx.session.exercise.repeats.push({ count: data[0], weight: data[1] })
      return ctx.reply('✔')
    }
    else return ctx.reply(errorMessage)
  }

  else if (repeat.match(regCount)) {
    if (format === 'count') {
      ctx.session.exercise.repeats.push({ count: repeat })
      return ctx.reply('✔')
    }
    else return ctx.reply(errorMessage)
  }

  return ctx.reply(errorMessage)
})

module.exports = repeatsScene