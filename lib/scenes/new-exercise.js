const Scene = require('telegraf/scenes/base')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const moment = require('moment')
const userDb = require('../db/controllers/user.controller')
const isForgetful = require('../is-forgetgul')

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

/**
 * End training and if ctx.session.train.exercises is not empty write it to the db
 * @param {Object} ctx - user's context
 */
let endTrain = async function (ctx) {
  if (ctx.session.train.exercises.length > 0) {
    ctx.session.train.dateEnd = moment(ctx.session.train.lastMessageDate).format()
    await userDb.addTrain(ctx.from.id, ctx.session.train)
  }

  ctx.session.train = {}
  ctx.scene.enter('rest')
}

module.exports = newExerciseScene