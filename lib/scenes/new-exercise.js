const Scene = require('telegraf/scenes/base')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')

const newExerciseScene = new Scene('newExercise')

const enterMessage = 'Выбери формат записи результатов для нового упражнения'
const enterKeyboard = ['Повторения-вес', 'Повторения', 'Время', 'Отмена']

newExerciseScene.enter(ctx => ctx.reply(enterMessage, Markup.keyboard(enterKeyboard).extra()))

newExerciseScene.hears('Повторения-вес', ctx => {
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

newExerciseScene.hears('🔙 Отмена', ctx => ctx.scene.enter('exercises'))

module.exports = newExerciseScene