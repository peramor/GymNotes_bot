const moment = require('moment')

module.exports = function (ctx) {
  let lastMessageDate = ctx.session.train.lastMessageDate
  
  if (lastMessageDate) {
    let difference = moment(ctx.message.date, 'X').diff(moment(lastMessageDate), 'seconds')

    if (difference > 20)
      return true
    else return false
  }

  let trainDateStart = ctx.session.train.dateStart

  if (trainDateStart) {
    let difference = moment(ctx.message.date, 'X').diff(moment(trainDateStart), 'seconds')

    if (difference > 20)
      return true
    else return false
  }
}