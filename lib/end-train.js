const moment = require('moment')
const userDb = require('./db/controllers/user.controller')

module.exports = async function (ctx) {
  if (ctx.session.train.exercises.length > 0) {
    ctx.session.train.dateEnd = moment(ctx.session.train.lastMessageDate).format()
    await userDb.addTrain(ctx.from.id, ctx.session.train)
  }

  ctx.session.train = {}
  ctx.scene.enter('rest')
}