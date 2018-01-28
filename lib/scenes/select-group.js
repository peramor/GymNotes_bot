const Scene = require('telegraf/scenes/base')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const exercises = require('../../exercises')
const exerciseDb = require('../db/controllers/exercise.controller')
const userDb = require('../db/controllers/user.controller')

const selectGroupScene = new Scene('selectGroup')

selectGroupScene.enter(ctx => {
  userDb.getUserExercises(ctx.from.id, ctx.session.exercise.group)
    .then(res => {
      let keyboard = []
      if (res.length > 0) {
        keyboard = res.map(e => e.name)
        keyboard.push('Больше', 'Назад')
        ctx.reply('Выбери упражнение.', Extra.markup(Markup.keyboard(keyboard)))
      }
      else {
        exerciseDb.getByGroup(ctx.session.exercise.group)
          .then(res => {
            keyboard = res.map(e => e.name)
            keyboard.push('Назад')
            ctx.reply('Выбери упражнение.', Extra.markup(Markup.keyboard(keyboard)))
          })
      }
    })
})

selectGroupScene.hears('Больше', ctx => {
  let keyboard = []
  userDb.getUserExercises(ctx.from.id, ctx.session.exercise.group)
    .then(res => {
      res.map(e => e.name).forEach(e => keyboard.push(e))
      exerciseDb.getByGroup(ctx.session.exercise.group)
        .then(res => {
          res.map(e => e.name).forEach(e => keyboard.push(e))
          keyboard.push('Назад')
          ctx.reply('Выбери упражнение.', Extra.markup(Markup.keyboard(keyboard)))
        })
    })
})

selectGroupScene.hears('Назад', ctx => ctx.scene.enter('startWorkout'))

selectGroupScene.on('message', ctx => {
  const exercise = ctx.message.text
  ctx.session.exercise.name = exercise
  ctx.scene.enter('selectExercise')
})

module.exports = selectGroupScene