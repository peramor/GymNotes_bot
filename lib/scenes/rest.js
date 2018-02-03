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
    exercises: []
  }
  return ctx.scene.enter('startWorkout')
})

restScene.hears('Посмотреть предыдущие тренировки', ctx => ctx.scene.enter('showHistory'))

module.exports = restScene