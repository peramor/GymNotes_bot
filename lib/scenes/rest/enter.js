const Markup = require('telegraf/markup')
const userDb = require('../../db/controllers/user.controller')

module.exports = async function (ctx) {
  let trains = await userDb.getTrains(ctx.from.id)

  let keyboard = ['Начать тренировку']

  if (trains.length > 0)
    keyboard.push('Посмотреть предыдущие тренировки')

  ctx.reply('Отдыхаем', Markup.keyboard(keyboard).extra())
}