const Markup = require('telegraf/markup')
const userDb = require('../../db/controllers/user.controller')
const exerciseDb = require('../../db/controllers/exercise.controller')

/**
 * Send message to a user with exercises keyboard
 * @param {Object} ctx context of user's request
 */
module.exports = async function (ctx) {
  let keyboard = []

  const exercises = ctx.session.train.exercises
  const group = ctx.session.train.currentGroup

  // if user has already done some exercises on the current group, include them into keyboard to the top
  if (exercises.length > 0)
    for (let i = 0; i < exercises.length; i++)
      if (exercises[i].group === group)
        keyboard.push(exercises[i].name)

  let userExercises = await userDb.getExercises(ctx.from.id, group)

  // if user has his own exercises from previous trainings, include them into keyboard and add 'more' button
  if (userExercises.length > 0) {
    userExercises.map(e => e.name).forEach(e => keyboard.push(e))
    keyboard.push('Больше')
  }
  // if not, include all default exercises
  else {
    let allExercises = await exerciseDb.getByGroup(group)
    allExercises.map(e => e.name).forEach(e => keyboard.push(e))
  }

  keyboard.push('🔙 Сменить группу мышц', '🔚 Завершить тренировку')
  keyboard = [... new Set(keyboard)]

  ctx.reply('Выбери упражнение или отправь свое', Markup.keyboard(keyboard).extra())
}