const Scene = require('telegraf/scenes/base')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')

const addExerciseScene = new Scene('addExercise')

const enterMessage = 'Выбери формат записи результатов для нового упражнения'
const enterKeyboard = ['повторения-вес', 'повторения', 'время']

addExerciseScene.enter(ctx => ctx.reply(enterMessage, Extra.markup(Markup.keyboard(enterKeyboard))))

addExerciseScene.hears(/(повторения\-вес)|(повторения)|(время)/g, ctx => {
  switch (ctx.message.text) {
    case 'повторения-вес':
      ctx.session.exercise.format = 'weight,count'
      break
    case 'повторения':
      ctx.session.exercise.format = 'count'
      break
    case 'время':
      ctx.session.exercise.format = 'time'
      break
  }
  ctx.scene.enter('selectExercise')
})

module.exports = addExerciseScene