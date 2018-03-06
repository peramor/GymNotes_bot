let token = process.env.METRICS_TOKEN // token for connecting to chatbase
if (!token) {
  console.warn(`Bot is not connected to the chatbase, because
  token is missed. Use METRICS_TOKEN environment variable for
  enable statistics.`)
  exports.track = () => { } // track is disabled
  exports.middleware = (ctx, next) => { next() }
  return
}

const { version } = require('../../package.json')
const startReg = /^\/start\s?(.+)?/
const request = require('request')

/**
 * Sends user's message to chatbase.
 * @param {Object} ctx Context of a message
 * @param {Object?} params additional params
 * @param {Boolean?} handled true if bot recognized the message, and false
 *  if doesn't. True is set by default.
 * @param {String?} intent of the sent message. Current scene as default
 * @returns {Promise} that resolves chatbase.Message object
 */
function track(ctx, params) {
  let handled = !(params && (params.handled === false)),
    intent = params && params.intent ? params.intent : 'current'

  let startMatch = startReg.exec(ctx.message.text)

  let msg = {
    user_id: ctx.from.id.toString(),
    time_stamp: (ctx.message.date * 1000).toString(),
    message: ctx.message.text
  }

  if (startMatch) {
    msg.intent = 'start'
    if (startMatch[1]) {
      let [spreadType, distributor] = startMatch[1].split('_')
      switch (spreadType) {
        case 'in':
          msg.url = 'invite'
          break
        case 'ad':
          msg.url = distributor
          break
        default:
          msg.url = distributor || spreadType
          break
      }
    } else
      msg.url = 'opendoor'
  } else
    msg.intent = intent === 'current' ? ctx.scene.current.id : intent

  if (!handled)
    msg.not_handled = true

  send(msg)
}

/**
 * Sends object to chatbase. 
 * @param {Object} msg to send, should contain fields
 *  which are described in API reference here:
 *  https://chatbase.com/documentation/ref
 */
function send(msg) {
  let data = {
    api_key: token,
    version: version,
    platform: "Telegram",
    type: "user",
  }

  for (let key in msg)
    data[key] = msg[key]

  request({
    uri: 'https://chatbase-area120.appspot.com/api/messages',
    method: 'POST',
    json: { messages: [data] }
  }, (err, res) => {
    let errMsg = res.statusCode === 400 ? res.body : err
    if (errMsg)
      console.error('chatbase:', errMsg || 'Bad request')
  })

  if (data.intent && data.intent === 'start' && data.url)
    request({
      uri: 'https://chatbase-area120.appspot.com/api/click',
      method: 'POST',
      json: data
    }, (err, res) => {
      let errMsg = res.statusCode === 400 ? res.body : err
      if (errMsg)
        console.error('chatbase:', errMsg || 'Bad request')
    })
}

exports.track = track
/**
 * Can be used instead of track as middleware for telegraf.
 * @param {Object} ctx Context of a message
 * @param {Function} next func in chain
 */
exports.middleware = (ctx, next) => {
  // call them in different threads
  track(ctx)
  return next()
}
