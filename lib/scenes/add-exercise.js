const Scene = require('telegraf/scenes/base')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')

const addExerciseScene = new Scene('addExercise')

const enterMessage = 'Выбери формат записи результатов для нового упражнения'
const enterKeyboard = ['Повторения-вес', 'Повторения', 'Время', 'Отмена']

addExerciseScene.enter(ctx => ctx.reply(enterMessage, Extra.markup(Markup.keyboard(enterKeyboard))))

addExerciseScene.hears('Повторения-вес', ctx => {
  ctx.session.exercise.format = 'weight,count'
  return ctx.scene.enter('selectExercise')  
})

addExerciseScene.hears('Повторения', ctx => {
  ctx.session.exercise.format = 'count'
  return ctx.scene.enter('selectExercise')  
})

addExerciseScene.hears('Время', ctx => {
  ctx.session.exercise.format = 'time'
  return ctx.scene.enter('selectExercise')  
})

addExerciseScene.hears('Отмена', ctx => ctx.scene.enter('selectGroup'))

module.exports = addExerciseScene