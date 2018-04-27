const { lastResultsToString } = require('./utils')
const {formatDict } = require('../../utils/dictionaries')
const userDb = require('../../db/controllers/user.controller')
const Markup = require('telegraf/markup')
const moment = require('moment')

/**
 * Sends user a message with previous results and the keyboard to get back
 * @param {Object} ctx context of user's request
 */
module.exports = async function (ctx) {
  // Get the exercise of current name and group
  let exercises = ctx.session.train.exercises
  let exercise = exercises.find(ex =>
    ex.name === ctx.session.train.currentExercise
    && ex.group === ctx.session.train.currentGroup)

  const format = exercise.format

  const enterKeyboard = ['🔙 Сменить упражнение', '🔚 Завершить тренировку']
  const enterMessage = `Отправляй подходы в формате ${formatDict[format].format}`

  // Get last user results in this exercise performing
  let lastResults = await userDb.getLastResults(ctx.from.id, exercise.name)
    .then(res => { return res },
      err => {
        console.error('Error occured when fetching last results on the exercise')
        return undefined
      })

  if (!lastResults)
    return ctx.reply(enterMessage, Markup.keyboard(enterKeyboard).extra())
  
  let previousWorkout = lastResultsToString(lastResults, format)

  let message = previousWorkout + '\n\n' + enterMessage

  return ctx.replyWithHTML(message, Markup.keyboard(enterKeyboard).extra())
}