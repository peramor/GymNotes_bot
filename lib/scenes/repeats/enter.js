const { dict, lastResultsToString } = require('./utils')
const userDb = require('../../db/controllers/user.controller')
const Markup = require('telegraf/markup')
const moment = require('moment')

module.exports = async function (ctx) {
  const format = ctx.session.exercise.format
  
  const enterKeyboard = ['🔙 Сменить упражнение', '🔚 Завершить тренировку']
  const enterMessage = `Отправляй подходы в формате ${dict[format].format}`

  let lastResults = await userDb.getLastResults(ctx.from.id, ctx.session.exercise.name)
  
  if (!lastResults)
    return ctx.reply(enterMessage, Markup.keyboard(enterKeyboard).extra())

  let previousWorkout = lastResultsToString(lastResults, format)

  let message = previousWorkout + '\n\n' + enterMessage

  return ctx.replyWithHTML(message, Markup.keyboard(enterKeyboard).extra())
}