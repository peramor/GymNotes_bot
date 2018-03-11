const moment = require('moment')
const userDb = require('../../db/controllers/user.controller')
const { makeMessage, makeInlineKeyboard } = require('./utils')

let startTrain = function (ctx) {
  ctx.session.train = {
    dateStart: moment().format(),
    exercises: []
  }

  ctx.scene.enter('groups')
}

let showPrevTrains = async function (ctx) {
  let trains = await userDb.getTrains(ctx.from.id)

  let message = await makeMessage(ctx.from.id, trains[0].dateStart)

  let inlineKeyboard = await makeInlineKeyboard(ctx.from.id, trains[0].dateStart)

  ctx.replyWithHTML(message, inlineKeyboard.extra())
}

module.exports = {
  startTrain,
  showPrevTrains
}