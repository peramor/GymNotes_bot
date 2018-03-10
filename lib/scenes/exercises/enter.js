const Markup = require('telegraf/markup')
const userDb = require('../../db/controllers/user.controller')
const exerciseDb = require('../../db/controllers/exercise.controller')

module.exports = async function (ctx) {
  let keyboard = []

  const exercises = ctx.session.train.exercises
  const group = ctx.session.exercise.group

  if (exercises.length > 0)
    for (let i = 0; i < exercises.length; i++)
      if (exercises[i].group === group)
        keyboard.push(exercises[i].name)

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
}