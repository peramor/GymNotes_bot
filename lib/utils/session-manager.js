const moment = require('moment')
const Markup = require('telegraf/markup')
const Extra = require('telegraf/extra')
const { makeMessage, makeInlineKeyboard } = require('../scenes/rest/utils')
const userDb = require('../db/controllers/user.controller')
const { regWeightCount, regCount, regTime } = require('../scenes/repeats/utils')
const FormatException = require('../exceptions/format-exception')

/**
 * Check if user forgot to end training.
 * @param {Object} ctx context of user's request
 * @returns {boolean} true if last message was sent by user more than 60 min ago
 */
const isForgetful = function (ctx) {
  if (ctx.message && ctx.session.train.lastMessageDate) {
    let lastMessageDate = ctx.session.train.lastMessageDate

    if (lastMessageDate) {
      let difference = moment(ctx.message.date, 'X').diff(moment(lastMessageDate), 'minutes')

      return difference > 60
    }

    let trainDateStart = ctx.session.train.dateStart
    let difference = moment(ctx.message.date, 'X').diff(moment(trainDateStart), 'minutes')

    return difference > 60
  }

  return false
}

/**
 * End training and save results to database.
 * @param {Object} ctx context of user's request
 */
const endTrain = async function (ctx) {
  if (ctx.session.train.exercises.length > 0) {
    // Remove all 'Delete' buttons
    ctx.session.train.exercises.forEach(async e => {
      e.repeats.forEach(async r => {
        let botMessageId = r.botMessageId
        await ctx.telegram.editMessageReplyMarkup(ctx.chat.id, botMessageId, null, Markup.inlineKeyboard([]))
      })
    })

    ctx.session.train.dateEnd = moment(ctx.session.train.lastMessageDate).format()
    await userDb.addTrain(ctx.from.id, ctx.session.train)
  }

  ctx.session.train = {}
  return ctx.scene.enter('rest')
}

/**
 * Edit repeat.
 * @param {Object} ctx context of user's request
 */
let editRepeat = async function (ctx) {
  let editedMessageId = ctx.editedMessage.message_id
  let editedRepeat = ctx.editedMessage.text

  let exercises = ctx.session.train.exercises

  let repeatToEdit = undefined
  // Find the exercise and the repeat that was edited
  let exercise = exercises.find(ex => {
    repeatToEdit = ex.repeats.find(r => r.userMessageId === editedMessageId)
    return !!repeatToEdit
  })

  // If user tried to edit a repeat from previous training or another message send him this message
  if (!repeatToEdit)
    return ctx.reply('Ошибка')

  let format = exercise.format

  if (format === 'weight,count' && editedRepeat.match(regWeightCount)) {
    const data = editedRepeat.split(/[-–—]/)
    repeatToEdit.weight = Number(data[0].replace(',', '.'))
    repeatToEdit.count = Number(data[1])
  }
  else if (format === 'count' && editedRepeat.match(regCount)) {
    repeatToEdit.count = Number(editedRepeat)
  }
  else if (format === 'time' && editedRepeat.match(regTime)) {
    const data = editedRepeat.split(/[:]/)
    repeatToEdit.time = parseInt(data[0]) * 60 + parseInt(data[1])
  }
  // Throw FormatException if edited message doesn't match pattern
  else {
    try {
      throw new FormatException(ctx, format)
    }
    catch (err) {
      ctx.reply(err.message)
      return
    }
  }

  let chatId = ctx.editedMessage.chat.id
  let botMessageId = repeatToEdit.botMessageId

  let deleteButton = Markup.callbackButton('Удалить', `delete repeat`)

  // Edit bot's reply to message with repeat
  return ctx.telegram.editMessageText(chatId, botMessageId, null, `Подход записан: ${editedRepeat} (изм.)`,
    Markup.inlineKeyboard([deleteButton]).extra())
}

/**
 * Delete repeat.
 * @param {Object} ctx context of user's request
 */
let deleteRepeat = async function (ctx) {
  let botMessageId = ctx.callbackQuery.message.message_id
  let exercises = ctx.session.train.exercises
  for (let i = 0; i < exercises.length; i++) {
    let index = exercises[i].repeats.findIndex(r => r.botMessageId === botMessageId)
    if (index !== -1) {
      exercises[i].repeats.splice(index, 1)
      break
    }
  }
  await ctx.editMessageText('Подход удален')
}

/**
 * Change message containing trainings history
 * @param {Object} ctx context of user's request
 */
let changeTrain = async function (ctx) {
  const date = ctx.callbackQuery.data

  if (date !== 'current') {
    let message = await makeMessage(ctx.from.id, date)

    let inlineKeyboard = await makeInlineKeyboard(ctx.from.id, date)

    return await ctx.editMessageText(message, Extra.HTML().markup(inlineKeyboard))
  }
}

/**
 * Middleware that checks every message for 
 * @param {Object} ctx context of user's request
 */
let middleware = async function (ctx, next) {
  if (isForgetful(ctx)) {
    await ctx.reply('Предыдущая тренировка была завершена автоматически')
    await endTrain(ctx)
  }
  if (ctx.message && ctx.session && ctx.session.__scenes && ctx.session.__scenes.current !== 'rest')
    ctx.session.train.lastMessageDate = moment(ctx.message.date, 'X').format()

  await next()
}

module.exports = {
  endTrain,
  editRepeat,
  deleteRepeat,
  changeTrain,
  middleware
}