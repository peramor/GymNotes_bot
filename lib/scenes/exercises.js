const Scene = require('telegraf/scenes/base')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const exerciseDb = require('../db/controllers/exercise.controller')
const userDb = require('../db/controllers/user.controller')
const moment = require('moment')

const exercisesScene = new Scene('exercises')

exercisesScene.enter(async function (ctx) {
  let keyboard = []
  let allExercises = await exerciseDb.getByGroup(ctx.session.exercise.group)

  if (Object.keys(ctx.session.train.exercises).length > 0)
    for (let property in ctx.session.train.exercises)
      if (ctx.session.train.exercises[property].group === ctx.session.exercise.group)
        keyboard.push(property)

  return userDb.getExercises(ctx.from.id, ctx.session.exercise.group)
    .then(userExercises => {
      userExercises = userExercises || [];

      if (userExercises.length > 2 && allExercises.length > 0) {
        userExercises.map(e => e.name).forEach(e => keyboard.push(e))
        keyboard.push('Больше')
      } else {
        userExercises.push(allExercises.map(e => e.name).forEach(e => keyboard.push(e)))
      }

      keyboard.push('🔙 Сменить группу мышц', '🔚 Завершить тренировку')
      keyboard = [... new Set(keyboard)]
      return ctx.reply('Выбери упражнение или отправь свое', Markup.keyboard(keyboard).extra())
    })
})

exercisesScene.hears('Больше', ctx => {
  let keyboard = []

  if (Object.keys(ctx.session.train.exercises).length > 0)
    for (let property in ctx.session.train.exercises)
      if (ctx.session.train.exercises[property].group === ctx.session.exercise.group)
        keyboard.push(property)

  return userDb.getExercises(ctx.from.id, ctx.session.exercise.group)
    .then(exercises => {
      if (exercises && exercises.length > 0)
        exercises.map(e => e.name).forEach(e => keyboard.push(e))

      return exerciseDb.getByGroup(ctx.session.exercise.group)
        .then(exercises => {
          exercises.map(e => e.name).forEach(e => keyboard.push(e))
          keyboard.push('🔙 Сменить группу мышц', '🔚 Завершить тренировку')
          keyboard = [... new Set(keyboard)]
          return ctx.reply('Выбери упражнение или отправь свое', Markup.keyboard(keyboard).extra())
        })
    })
})

exercisesScene.hears(/Сменить группу мышц/gi, ctx => ctx.scene.enter('groups'))

exercisesScene.hears(/Завершить тренировку/gi, ctx => {
  if (Object.keys(ctx.session.train.exercises).length > 0) {
    ctx.session.train.dateEnd = moment().format()
    userDb.addTrain(ctx.from.id, ctx.session.train)
  }
  ctx.session.train = {}
  ctx.scene.enter('rest')
})

exercisesScene.on('text', ctx => {
  if (ctx.message.text.match(/(Спина|Грудь|Ноги|Руки|Плечи|Пресс)/)) return

  if (ctx.session.train && Object.keys(ctx.session.train.exercises).length > 0)
    for (let property in ctx.session.train.exercises)
      if (ctx.session.train.exercises[property].group === ctx.message.text)
        return ctx.scene.enter('repeats')

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