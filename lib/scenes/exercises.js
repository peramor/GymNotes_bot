const Scene = require('telegraf/scenes/base')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const moment = require('moment')
const userDb = require('../db/controllers/user.controller')
const exerciseDb = require('../db/controllers/exercise.controller')

const exercisesScene = new Scene('exercises')

exercisesScene.enter(async ctx => {
  let keyboard = []

  const exercises = ctx.session.train.exercises
  const group = ctx.session.exercise.group

  if (Object.keys(exercises).length > 0)
    for (let property in exercises)
      if (exercises[property].group === group)
        keyboard.push(property)

  let userExercises = await userDb.getExercises(ctx.from.id, group)

  if (userExercises.length > 0) {
    userExercises.map(e => e.name).forEach(e => keyboard.push(e))
    keyboard.push('Больше')
  }
  else {
    let allExercises = await exerciseDb.getByGroup(group)
    allExercises.map(e => e.name).forEach(e => keyboard.push(e))
  }

  keyboard.push('🔙 Сменить группу мышц', '🔚 Завершить тренировку')
  keyboard = [... new Set(keyboard)]

  ctx.reply('Выбери упражнение или отправь свое', Markup.keyboard(keyboard).extra())
})

exercisesScene.hears('Больше', async ctx => {
  let keyboard = []

  const exercises = ctx.session.train.exercises
  const group = ctx.session.exercise.group

  if (Object.keys(exercises).length > 0)
    for (let property in exercises)
      if (exercises[property].group === group)
        keyboard.push(property)

  let userExercises = await userDb.getExercises(ctx.from.id, group)
  userExercises.map(e => e.name).forEach(e => keyboard.push(e))

  let allExercises = await exerciseDb.getByGroup(group)
  allExercises.map(e => e.name).forEach(e => keyboard.push(e))
  
  keyboard.push('🔙 Сменить группу мышц', '🔚 Завершить тренировку')
  keyboard = [... new Set(keyboard)]
  
  ctx.reply('Выбери упражнение или отправь свое', Markup.keyboard(keyboard).extra())
})

exercisesScene.hears(/Сменить группу мышц/gi, ctx => ctx.scene.enter('groups'))

exercisesScene.hears(/Завершить тренировку/gi, async ctx => {
  if (Object.keys(ctx.session.train.exercises).length > 0) {
    ctx.session.train.dateEnd = moment().format()
    await userDb.addTrain(ctx.from.id, ctx.session.train)
  }
  
  ctx.session.train = {}
  
  ctx.scene.enter('rest')
})

exercisesScene.on('text', async ctx => {
  if (ctx.message.text.match(/(Спина|Грудь|Ноги|Руки|Плечи|Пресс)/)) return

  ctx.session.exercise.name = ctx.message.text
  
  if (Object.keys(ctx.session.train.exercises).find(e => e === ctx.message.text)) {
    ctx.session.exercise.format = ctx.session.train.exercises[ctx.message.text].format
    return ctx.scene.enter('repeats')
  }


  let exercise = await exerciseDb.get(ctx.message.text)
  
  if (exercise) {
    ctx.session.exercise.format = exercise.format
    return ctx.scene.enter('repeats')
  }
  else {
    let userExercises = await userDb.getExercises(ctx.from.id, ctx.session.exercise.group)

    if (userExercises) {
      const exercise = userExercises.find(e => e.name === ctx.session.exercise.name)
      
      if (exercise) {
        ctx.session.exercise.format = exercise.format
        return ctx.scene.enter('repeats')
      }
    }
    return ctx.scene.enter('newExercise')
  }
})

module.exports = exercisesScene