const Scene = require('telegraf/scenes/base')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const moment = require('moment')

const restScene = new Scene('rest')
  
restScene.enter(ctx => ctx.reply('Отдыхаем', Extra.markup(Markup.keyboard(['Начать тренировку']))))
  
restScene.hears('Начать тренировку', ctx => {
  ctx.scene.enter('startWorkout')
  ctx.session.train = {
    dateStart: moment().format(),
    exercises: []
  }
})

module.exports = restScene