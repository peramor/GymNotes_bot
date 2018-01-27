const Scene = require('telegraf/scenes/base')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')

const selectExerciseScene = new Scene('selectExercise')
  
selectExerciseScene.enter(ctx => ctx.reply('Отправляй подходы в формате «повторения-вес».', Extra.markup(Markup.keyboard(['Завершить упражнение']))))
  
selectExerciseScene.hears(/[0-9]{1,3} [0-9]{1,3}/g, ctx => {
  const data = ctx.message.text.split(' ');
  ctx.session.exercise.repeats.push({weight: data[0], count: data[1]})
})
  
selectExerciseScene.hears('Завершить упражнение', ctx => {
  ctx.session.train.exercises.push({
    repeats: ctx.session.exercise.repeats,
    name: ctx.session.exercise.name,
    group: ctx.session.exercise.group
  })
  ctx.session.exercise.repeats = []
  ctx.session.exercise.name = ""
  ctx.scene.enter('selectGroup')
})

module.exports = selectExerciseScene