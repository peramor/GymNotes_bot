const Scene = require('telegraf/scenes/base')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const moment = require('moment')
const userDb = require('../db/controllers/user.controller')

const startWorkoutScene = new Scene('startWorkout')

const enterMessage = 'Выбери группу мышц'
const enterKeyboard = ['Спина', 'Грудь', 'Ноги', 'Руки', 'Плечи', 'Пресс', 'Завершить тренировку']

startWorkoutScene.enter(ctx => ctx.reply(enterMessage, Extra.markup(Markup.keyboard(enterKeyboard))))

const reg = new RegExp('(' + enterKeyboard.join('|') + ')', 'gi')

startWorkoutScene.hears(reg, ctx => {
  if (ctx.message.text === 'Завершить тренировку') {
    const train = ctx.session.train
    if (train.exercises.length > 0) {
      train.dateEnd = moment().format()
      userDb.addTrain(ctx.from.id, train)
    }
    
    ctx.session.train = {}
    ctx.scene.enter('rest')
  }
  else {
    ctx.session.exercise = {
      group: ctx.message.text,
      repeats: []
    }
    ctx.scene.enter('selectGroup')
  }
})

module.exports = startWorkoutScene