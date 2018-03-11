const moment = require('moment')
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
    ctx.session.train.dateEnd = moment(ctx.session.train.lastMessageDate).format()
    await userDb.addTrain(ctx.from.id, ctx.session.train)
  }

  ctx.session.train = {}
  ctx.scene.enter('rest')
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

  // Edit bot's reply to message with repeat
  return ctx.telegram.editMessageText(chatId, botMessageId, null, `Подход записан: ${editedRepeat} (изм.)`)
}

exports.endTrain = endTrain

exports.editRepeat = editRepeat

exports.middleware = async (ctx, next) => {
  if (isForgetful(ctx)) {
    await ctx.reply('Предыдущая тренировка была завершена автоматически')
    await endTrain(ctx)
  }
  if (ctx.message && ctx.session && ctx.session.__scenes && ctx.session.__scenes.current !== 'rest')
    ctx.session.train.lastMessageDate = moment(ctx.message.date, 'X').format()

  await next()
}