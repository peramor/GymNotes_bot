const Scene = require('telegraf/scenes/base')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const moment = require('moment')
const userDb = require('../db/controllers/user.controller')

const groupsScene = new Scene('groups')

groupsScene.enter(ctx => ctx.reply('Выбери группу мышц', Markup
  .keyboard(['Спина', 'Грудь', 'Ноги', 'Руки', 'Плечи', 'Пресс', 'Завершить тренировку'])
  .extra()
))

groupsScene.hears(/(Спина|Грудь|Ноги|Руки|Плечи|Пресс|Завершить тренировку)/gi, ctx => {
  if (ctx.message.text === 'Завершить тренировку') {
    if (ctx.session.train.exercises.length > 0) {
      ctx.session.train.dateEnd = moment().format()
      userDb.addTrain(ctx.from.id, ctx.session.train)
    }
    ctx.session.train = {}
    ctx.scene.enter('rest')
  }
  else {
    ctx.session.exercise = {
      group: ctx.message.text,
      repeats: []
    }
    ctx.scene.enter('exercises')
  }
})

module.exports = groupsScene