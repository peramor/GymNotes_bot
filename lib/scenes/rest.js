const Scene = require('telegraf/scenes/base')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const moment = require('moment')
const userDb = require('../db/controllers/user.controller')

const restScene = new Scene('rest')

restScene.enter(ctx => {
  let keyboard = ['Начать тренировку']
  if (ctx.session.hasDiary)
    keyboard.push('Посмотреть предыдущие тренировки')

  ctx.reply('Отдыхаем', Markup.keyboard(keyboard).extra())
})

restScene.hears(/Начать тренировку/gi, ctx => {
  ctx.session.train = {
    dateStart: moment().format(),
    exercises: {}
  }
  return ctx.scene.enter('groups')
})

restScene.hears('Посмотреть предыдущие тренировки', ctx => {
  if (!ctx.session.hasDiary)
    return;

  ctx.reply(`Здесь ты можешь посмотреть предыдущие тренировки`,
    Markup
      .keyboard(['Начать тренировку', '🔙 Назад'])
      .extra()
  )

  ctx.scene.enter('history')
})

module.exports = restScene