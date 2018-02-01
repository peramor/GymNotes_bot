const Scene = require('telegraf/scenes/base')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const moment = require('moment')
const userDb = require('../db/controllers/user.controller')

const showHistoryScene = new Scene('showHistory')

let trains = null
let index = 0
let message = ''

const changeMessage = function (train) {
  message = `<b>Дата: ${moment(train.dateStart).format('DD.MM.YYYY')}</b>\n`

  train.exercises.forEach(exercise => {
    message = message.concat(`\n<b>${exercise.name}</b>\n`)

    if (exercise.format === 'weight,count')
      exercise.repeats.forEach(repeat => {
        message = message.concat(`${repeat.count}x${repeat.weight} `)
      })
    else if (exercise.format === 'count')
      exercise.repeats.forEach(repeat => {
        message = message.concat(`${repeat.count} `)
      })
    else exercise.repeats.forEach(repeat => {
      message = message.concat(`${repeat.time} `)
    })

    message = message.concat('\n')
  })
}

showHistoryScene.enter(ctx => {
  trains = null
  index = 0

  userDb.getTrains(ctx.from.id)
    .then(res => {
      if (!res) return ctx.reply('У тебя пока нет тренировок', Markup.keyboard(['Назад']).extra())

      trains = res
      changeMessage(trains[0])

      return ctx.reply('Чтобы получить данные за определённый день, отправь дату в формате "дд.мм.гггг"', Markup.keyboard(['Назад']).extra())
        .then(ctx.reply(message, Extra.HTML().markup((m) => m.inlineKeyboard([
          m.callbackButton('Пред.', 'prev', index === trains.length - 1),
          m.callbackButton('След.', 'next', index === 0)
        ]))))
    })
})

showHistoryScene.on('callback_query', ctx => {
  if (ctx.callbackQuery.data === 'prev')
    index += 1
  else index -= 1

  changeMessage(trains[index])

  return ctx.editMessageText(message, Extra.HTML().markup((m) => m.inlineKeyboard([
    m.callbackButton('Пред.', 'prev', index === trains.length - 1),
    m.callbackButton('След.', 'next', index === 0)
  ])))
})

showHistoryScene.hears('Назад', ctx => ctx.scene.enter('rest'))

module.exports = showHistoryScene