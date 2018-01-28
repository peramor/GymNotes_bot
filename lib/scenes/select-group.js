const Scene = require('telegraf/scenes/base')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const exercises = require('../../exercises')

const selectGroupScene = new Scene('selectGroup')
  
  // get user exercises
selectGroupScene.enter(ctx => ctx.reply('Выбери упражнение.', Extra.markup(Markup.keyboard(exercises[ctx.session.exercise.group]))))
  
selectGroupScene.hears('Назад', ctx => ctx.scene.enter('startWorkout'))
  
selectGroupScene.on('message', ctx => {
  const exercise = ctx.message.text
  ctx.session.exercise.name = exercise
  ctx.scene.enter('selectExercise')
})

module.exports = selectGroupScene