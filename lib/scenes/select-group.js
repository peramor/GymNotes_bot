const Scene = require('telegraf/scenes/base')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const exerciseDb = require('../db/controllers/exercise.controller')
const userDb = require('../db/controllers/user.controller')

const selectGroupScene = new Scene('selectGroup')

const enterMessage = 'Выбери упражнение или отправь свое'

let keyboard = []

selectGroupScene.enter(ctx => {
  keyboard = []

  if (ctx.session.train.exercises.length > 0)
    ctx.session.train.exercises.forEach(e => {
      if (e.group === ctx.session.exercise.group)
        keyboard.push(e.name)
    })

  userDb.getUserExercises(ctx.from.id, ctx.session.exercise.group)
    .then(exercises => {
      if (exercises && exercises.length > 0) {
        exercises.map(e => e.name).forEach(e => keyboard.push(e))
        keyboard.push('Больше', 'Назад')
        keyboard = [... new Set(keyboard)]
        ctx.reply(enterMessage, Extra.markup(Markup.keyboard(keyboard)))
      }
      else {
        exerciseDb.getByGroup(ctx.session.exercise.group)
          .then(exercises => {
            exercises.map(e => e.name).forEach(e => keyboard.push(e))
            keyboard.push('Назад')
            keyboard = [... new Set(keyboard)]
            ctx.reply(enterMessage, Extra.markup(Markup.keyboard(keyboard)))
          })
      }
    })
})

selectGroupScene.hears('Больше', ctx => {
  exerciseDb.getByGroup(ctx.session.exercise.group)
    .then(exercises => {
      keyboard = keyboard.slice(0, -2)
      exercises.map(e => e.name).forEach(e => keyboard.push(e))
      keyboard.push('Назад')
      keyboard = [... new Set(keyboard)]
      ctx.reply(enterMessage, Extra.markup(Markup.keyboard(keyboard)))
    })
})

selectGroupScene.hears('Назад', ctx => ctx.scene.enter('startWorkout'))

selectGroupScene.on('message', ctx => {
  const reg = new RegExp('(Спина|Грудь|Ноги|Руки|Плечи)')
  if (ctx.message.text.match(reg)) return
  
  ctx.session.exercise.name = ctx.message.text

  return exerciseDb.get(ctx.message.text)
    .then(exercise => {
      if (exercise) {
        ctx.session.exercise.format = exercise.format
        return ctx.scene.enter('selectExercise')
      }
      else {
        return userDb.getUserExercises(ctx.from.id, ctx.session.exercise.group)
          .then(exercises => {
            if (exercises) {
              const exercise = exercises.find(e => e.name === ctx.session.exercise.name)
              if (exercise) {
                ctx.session.exercise.format = exercise.format
                return ctx.scene.enter('selectExercise')
              }
            }
            return ctx.scene.enter('addExercise')
          })
      }
    })
})

module.exports = selectGroupScene