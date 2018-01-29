const Scene = require('telegraf/scenes/base')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const exerciseDb = require('../db/controllers/exercise.controller')
const userDb = require('../db/controllers/user.controller')

const selectGroupScene = new Scene('selectGroup')

selectGroupScene.enter(ctx => {
  let keyboard = []
  if (ctx.session.train.exercises.length > 0) {
    ctx.session.train.exercises.forEach(e => {
      if (e.group === ctx.session.exercise.group)
        keyboard.push(e.name)
    })
  }
  userDb.getUserExercises(ctx.from.id, ctx.session.exercise.group)
    .then(res => {
      if (res.length > 0) {
        res.map(e => e.name).forEach(e => keyboard.push(e))
        keyboard.push('Больше', 'Назад')
        keyboard = [... new Set(keyboard)]
        ctx.reply('Выбери упражнение или отправь свое.', Extra.markup(Markup.keyboard(keyboard)))
      }
      else {
        exerciseDb.getByGroup(ctx.session.exercise.group)
          .then(res => {
            res.map(e => e.name).forEach(e => keyboard.push(e))
            keyboard.push('Назад')
            keyboard = [... new Set(keyboard)]
            ctx.reply('Выбери упражнение или отправь свое.', Extra.markup(Markup.keyboard(keyboard)))
          })
      }
    })
})

selectGroupScene.hears('Больше', ctx => {
  let keyboard = []
  if (ctx.session.train.exercises.length > 0)
    ctx.session.train.exercises.forEach(e => {
      if (e.group === ctx.session.exercise.group)
        keyboard.push(e.name)
    })
  userDb.getUserExercises(ctx.from.id, ctx.session.exercise.group)
    .then(res => {
      res.map(e => e.name).forEach(e => keyboard.push(e))
      exerciseDb.getByGroup(ctx.session.exercise.group)
        .then(res => {
          res.map(e => e.name).forEach(e => keyboard.push(e))
          keyboard.push('Назад')
          keyboard = [... new Set(keyboard)]
          ctx.reply('Выбери упражнение или отправь свое.', Extra.markup(Markup.keyboard(keyboard)))
        })
    })
})

selectGroupScene.hears('Назад', ctx => ctx.scene.enter('startWorkout'))

selectGroupScene.on('message', ctx => {
  // check on group
  ctx.session.exercise.name = ctx.message.text
  return exerciseDb.getExercise(ctx.message.text)
    .then(res => {
      if (res) {
        ctx.session.exercise.format = res.format
        ctx.scene.enter('selectExercise')
      }
      else {
        return userDb.getUserExercises(ctx.from.id, ctx.session.exercise.group)
          .then(res => {
            const exercise = res.find(e => e.name === ctx.session.exercise.name)
            if (exercise) {
              ctx.session.exercise.format = exercise.format
              ctx.scene.enter('selectExercise')
            }
            else ctx.scene.enter('addExercise')
          })
      }
    })
})

module.exports = selectGroupScene