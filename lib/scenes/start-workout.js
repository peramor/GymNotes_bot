const Scene = require('telegraf/scenes/base')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const exercises = require('../../exercises')
const fs = require('fs')
const allGroups = ['Грудь', 'Спина', 'Ноги', 'Руки', 'Плечи']
const startWorkoutScene = new Scene('startWorkout')
const moment = require('moment')
const userDb = require('../db/controllers/user.controller')

startWorkoutScene.enter(ctx => ctx.reply('Выбери группу мышц.', Extra.markup(
  Markup.keyboard(
    ['Грудь', 'Спина', 'Ноги', 'Руки', 'Плечи', 'Завершить тренировку']
  )
)))

let reg = new RegExp('(' + allGroups.join('|') + ')', 'gi')

startWorkoutScene.hears(reg, ctx => {
  const groupName = ctx.message.text
  if (exercises[groupName]) {
    ctx.session.exercise = {
      group: groupName,
      repeats: []
    }
    ctx.scene.enter('selectGroup')
  }
  else {
    ctx.reply('Ошибка')
    ctx.scene.enter('startWorkout')
  }
})

startWorkoutScene.hears('Завершить тренировку', ctx => {
  // fs.writeFileSync(`notebook/train-${moment(ctx.session.train.date).format('YYYY-MM-DDTHH-mm-ss')}.json`, JSON.stringify(ctx.session.train))
  let train = ctx.session.train
  train.dateEnd = moment().format()
  userDb.addTrain(ctx.from.id, train)
  ctx.session.train = {}
  ctx.scene.enter('rest')
})

module.exports = startWorkoutScene