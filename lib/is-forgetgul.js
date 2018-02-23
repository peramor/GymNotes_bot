const moment = require('moment')

module.exports = function (ctx) {
  let lastMessageDate = ctx.session.train.lastMessageDate
  
  if (lastMessageDate) {
    let difference = moment(ctx.message.date, 'X').diff(moment(lastMessageDate), 'minutes')

    if (difference > 60)
      return true
    else return false
  }

  let trainDateStart = ctx.session.train.dateStart
  let difference = moment(ctx.message.date, 'X').diff(moment(trainDateStart), 'minutes')

  if (difference > 60)
    return true
  else return false
}