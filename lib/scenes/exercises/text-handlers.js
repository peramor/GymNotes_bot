const Markup = require('telegraf/markup')
const userDb = require('../../db/controllers/user.controller')
const exerciseDb = require('../../db/controllers/exercise.controller')

let showMore = async function (ctx) {
  let keyboard = []

  const exercises = ctx.session.train.exercises
  const group = ctx.session.exercise.group

  if (exercises.length > 0)
    for (let i = 0; i < exercises.length; i++)
      if (exercises[i].group === group)
        keyboard.push(exercises[i].name)

  let userExercises = await userDb.getExercises(ctx.from.id, group)
  userExercises.map(e => e.name).forEach(e => keyboard.push(e))

  let allExercises = await exerciseDb.getByGroup(group)
  allExercises.map(e => e.name).forEach(e => keyboard.push(e))

  keyboard.push('🔙 Сменить группу мышц', '🔚 Завершить тренировку')
  keyboard = [... new Set(keyboard)]

  ctx.reply('Выбери упражнение или отправь свое', Markup.keyboard(keyboard).extra())
}

let selectExercise = async function (ctx) {
  if (ctx.message.text.match(/(Спина|Грудь|Ноги|Руки|Плечи|Пресс)/)) return

  ctx.session.exercise.name = ctx.message.text
  
  let repeatedExercise = ctx.session.train.exercises.find(e => e.name === ctx.message.text)
  if (repeatedExercise) {
    ctx.session.exercise.format = repeatedExercise.format
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
}

module.exports = {
  showMore,
  selectExercise
}