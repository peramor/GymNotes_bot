const Scene = require('telegraf/scenes/base')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const fs = require('fs')
const moment = require('moment')
const exercises = require('../../exercises')

const startWorkoutScene = new Scene('startWorkout')

startWorkoutScene.enter(ctx => {
  const keyboard = Object.getOwnPropertyNames(exercises)
  keyboard.push('Завершить тренировку')
  ctx.reply('Выбери группу мышц.', Extra.markup(Markup.keyboard(keyboard)))
})

const reg = new RegExp('(' + Object.getOwnPropertyNames(exercises).join('|') + ')', 'gi')

startWorkoutScene.hears(reg, ctx => {
  const groupName = ctx.message.text
  ctx.session.exercise = {
    group: groupName,
    repeats: []
  }
  ctx.scene.enter('selectGroup')
})

startWorkoutScene.hears('Завершить тренировку', ctx => {
  ctx.session.train.endDate = moment().format()
  fs.writeFileSync(`notebook/train-${moment().format('YYYY-MM-DDTHH-mm-ss')}.json`, JSON.stringify(ctx.session.train))
  ctx.session.train = {}
  ctx.scene.enter('rest')
})

module.exports = startWorkoutScene