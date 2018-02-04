const Scene = require('telegraf/scenes/base')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const moment = require('moment')

const restScene = new Scene('rest')

restScene.enter(ctx => ctx.reply('Отдыхаем', Markup
  .keyboard(['Начать тренировку', 'Посмотреть предыдущие тренировки'])
  .extra()
))

restScene.hears('Начать тренировку', ctx => {
  ctx.session.train = {
    dateStart: moment().format(),
    exercises: {}
  }
  return ctx.scene.enter('groups')
})

restScene.hears('Посмотреть предыдущие тренировки', ctx => {
  ctx.scene.enter('history')
  ctx.reply(`Здесь ты можешь посмотреть предыдущие тренировки`,
    Markup
    .keyboard(['Начать тренировку', '🔙 Назад'])
    .extra()
  )
})

module.exports = restScene