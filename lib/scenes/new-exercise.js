const Scene = require('telegraf/scenes/base')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const moment = require('moment')
const userDb = require('../db/controllers/user.controller')
const {isForgetful, endTrain} = require('../common-functions')

const newExerciseScene = new Scene('newExercise')

const enterMessage = 'Выбери формат записи результатов для нового упражнения'
const enterKeyboard = ['Вес-повторения', 'Повторения', 'Время', '🔙 Отмена']

newExerciseScene.enter(ctx => ctx.reply(enterMessage, Markup.keyboard(enterKeyboard).extra()))

newExerciseScene.on('text', async (ctx, next) => {
  if (isForgetful(ctx)) {
    await ctx.reply('Предыдущая тренировка была завершена автоматически')
    await endTrain(ctx)
    }
  else
    await next()
})

newExerciseScene.hears('Вес-повторения', ctx => {
  ctx.session.exercise.format = 'weight,count'
  return ctx.scene.enter('repeats')  
})

newExerciseScene.hears('Повторения', ctx => {
  ctx.session.exercise.format = 'count'
  return ctx.scene.enter('repeats')  
})

newExerciseScene.hears('Время', ctx => {
  ctx.session.exercise.format = 'time'
  return ctx.scene.enter('repeats')  
})

newExerciseScene.hears(/Отмена/gi, ctx => ctx.scene.enter('exercises'))

module.exports = newExerciseScene