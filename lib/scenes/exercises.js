/**
 * 
 */

const Scene = require('telegraf/scenes/base')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const exerciseDb = require('../db/controllers/exercise.controller')
const userDb = require('../db/controllers/user.controller')

const exercisesScene = new Scene('exercises')

exercisesScene.enter(ctx => {
  let keyboard = []

  if (ctx.session.train && ctx.session.train.exercises.length > 0)
    ctx.session.train.exercises.forEach(e => {
      if (e.group === ctx.session.exercise.group)
        keyboard.push(e.name)
    })

  return userDb.getExercises(ctx.from.id, ctx.session.exercise.group)
    .then(exercises => {
      if (exercises && exercises.length > 0) {
        exercises.map(e => e.name).forEach(e => keyboard.push(e))
        keyboard.push('Больше', 'Назад')
        keyboard = [... new Set(keyboard)]
      }
      else {
        exerciseDb.getByGroup(ctx.session.exercise.group)
          .then(exercises => {
            exercises.map(e => e.name).forEach(e => keyboard.push(e))
            keyboard.push('Назад')
            keyboard = [... new Set(keyboard)]
          })
      }
      return ctx.reply('Выбери упражнение или отправь свое', Markup.keyboard(keyboard).extra())
    })
})

exercisesScene.hears('Больше', ctx => {
  let keyboard = []

  if (ctx.session.train.exercises.length > 0)
    ctx.session.train.exercises.forEach(e => {
      if (e.group === ctx.session.exercise.group)
        keyboard.push(e.name)
    })

  return userDb.getExercises(ctx.from.id, ctx.session.exercise.group)
    .then(exercises => {
      if (exercises && exercises.length > 0)
        exercises.map(e => e.name).forEach(e => keyboard.push(e))

      return exerciseDb.getByGroup(ctx.session.exercise.group)
        .then(exercises => {
          exercises.map(e => e.name).forEach(e => keyboard.push(e))
          keyboard.push('Назад')
          keyboard = [... new Set(keyboard)]
          return ctx.reply('Выбери упражнение или отправь свое', Markup.keyboard(keyboard).extra())
        })
    })
})

exercisesScene.hears('Назад', ctx => ctx.scene.enter('groups'))

exercisesScene.on('message', ctx => {
  if (ctx.message.text.match(/(Спина|Грудь|Ноги|Руки|Плечи|Пресс)/)) return

  ctx.session.exercise.name = ctx.message.text

  return exerciseDb.get(ctx.message.text)
    .then(exercise => {
      if (exercise) {
        ctx.session.exercise.format = exercise.format
        return ctx.scene.enter('repeats')
      }
      else {
        return userDb.getExercises(ctx.from.id, ctx.session.exercise.group)
          .then(exercises => {
            if (exercises) {
              const exercise = exercises.find(e => e.name === ctx.session.exercise.name)
              if (exercise) {
                ctx.session.exercise.format = exercise.format
                return ctx.scene.enter('repeats')
              }
            }
            return ctx.scene.enter('newExercise')
          })
      }
    })
})

module.exports = exercisesScene