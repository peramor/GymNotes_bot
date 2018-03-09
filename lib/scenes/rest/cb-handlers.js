const Extra = require('telegraf/extra')
const { makeMessage, makeInlineKeyboard } = require('./utils')

module.exports = async function (ctx) {
  try {
    const date = ctx.callbackQuery.data

    if (date !== 'current') {
      let message = await makeMessage(ctx.from.id, date)

      let inlineKeyboard = await makeInlineKeyboard(ctx.from.id, date)

      return await ctx.editMessageText(message, Extra.HTML().markup(inlineKeyboard))
    }
  }
  catch (error) {
    return
  }
} 