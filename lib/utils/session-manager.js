const moment = require('moment')
const userDb = require('./db/controllers/user.controller')

/**
 * End training and save results to database.
 * @param {Object} ctx User's context
 */
const endTrain = async function (ctx) {
  if (ctx.session && ctx.session.train && ctx.session.train.exercises && ctx.session.train.exercises.length > 0) {
    ctx.session.train.dateEnd = moment(ctx.session.train.lastMessageDate).format()
    await userDb.addTrain(ctx.from.id, ctx.session.train)
  }

  ctx.session.train = {}
  ctx.scene.enter('rest')
}

/**
 * Check if user forgot to end training.
 * @param {Object} ctx User's context
 * @returns {boolean} true if last message was sent by user more than 60 min ago
 */
const isForgetful = function (ctx) {
  let lastMessageDate = ctx.session.train.lastMessageDate
  
  if (lastMessageDate) {
    let difference = moment(ctx.message.date, 'X').diff(moment(lastMessageDate), 'minutes')

    return difference > 60
  }

  let trainDateStart = ctx.session.train.dateStart
  let difference = moment(ctx.message.date, 'X').diff(moment(trainDateStart), 'minutes')

  return difference > 60
}

module.exports.endTrain = endTrain
module.exports.isForgetful = isForgetful