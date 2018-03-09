let token = process.env.METRICS_TOKEN // token for connecting to chatbase
if (!token) {
  console.warn(`Bot is not connected to the chatbase, because
  token is missed. Use METRICS_TOKEN environment variable for
  enable statistics.`)
  exports.track = () => { } // track is disabled
  exports.middleware = (ctx, next) => { next() }
  return
}

// patch agregated version: like 1.2.x
const version = require('../../package.json').version.split('.').slice(0, 2).join('.') + '.x'
// regex for /start messages with optional payload
const startReg = /^\/start\s?(.+)?/
const request = require('request')

/**
 * Sends user's message to chatbase.
 * @param {Object} ctx Context of a message
 * @param {Object?} params additional params
 * @param {Boolean?} params.handled true if bot recognized the message, and false
 *  if doesn't. True is set by default.
 * @param {String?} params.intent of the sent message. Current scene as default
 * @param {String?} params.botReply - text which contains reply of bot
 * @returns {Promise} that resolves chatbase.Message object
 */
async function track(ctx, params = {}) {
  let msg = {
    user_id: ctx.from.id.toString(),
    time_stamp: (ctx.message.date * 1000).toString(),
    message: ctx.message.text,
    type: "user"    
  }

  if (params.intent)
    msg.intent = params.intent
  else if (ctx && ctx.scene && ctx.scene.current && ctx.scene.current.id)
    msg.intent = ctx.scene.current.id
  else
    msg.intent = 'start'

  if (params.handled === false)
    msg.not_handled = true

  processStart(msg) // special case for /start messages
  prepareAndSend(msg, params.botReply)
}

/**
 * Fullfill object with url and intent-start if needed
 * @param {Object} msg - track message
 */
function processStart(msg) {
  let startMatch = startReg.exec(msg.message)
  if (!startMatch)
    return

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
        msg.url = '' // otherwise we assume that somebody click on /start again
        break
    }
  } else
    msg.url = '' // otherwise we assume that somebody click on /start again
}

async function trackBotReply(ctx, botReply) {
  let msg = {
    user_id: ctx.from.id.toString(),
    time_stamp: Date.now().toString(),
    message: botReply,
    type: "agent"
  }

  prepareAndSend(msg)
}

/**
 * Sends object to chatbase. 
 * @param {Object} msg to send, should contain fields
 *  which are described in API reference here:
 *  https://chatbase.com/documentation/ref
 * @param {String?} botReplyMessage - message with bot reply
 *  will be send together with user's message if set
 */
async function prepareAndSend(msg) {
  let data = {
    api_key: token,
    version: version,
    platform: "Telegram"
  }

  for (let key in msg)
    data[key] = msg[key]

  let messages = [data]

  request({
    uri: 'https://chatbase-area120.appspot.com/api/messages',
    method: 'POST',
    json: { messages }
  }, (err, res) => {
    let errMsg = !res.body.all_succeeded ? res.body : err
    if (errMsg)
      console.error('chatbase:', errMsg)
  })

  // track source of traffic
  if (data.intent === 'start' && data.url)
    request({
      uri: 'https://chatbase-area120.appspot.com/api/click',
      method: 'POST',
      json: data
    }, (err, res) => {
      let errMsg = res.statusCode === 400 ? res.body : err
      if (errMsg)
        console.error('chatbase:', errMsg)
    })
}

exports.track = track
exports.trackBotReply = trackBotReply
/**
 * Can be used instead of track as middleware for telegraf.
 * @param {Object} ctx Context of a message
 * @param {Function} next func in chain
 */
exports.middleware = (ctx, next) => {
  // call them in async, because we don't want to block the thread
  track(ctx)
  return next()
}