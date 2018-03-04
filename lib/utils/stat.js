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
const chatbase = require('@google/chatbase')
  .setApiKey(token)
  .setPlatform('Telegram')
  .setVersion(version) // the version that the deployed bot is

/**
 * Sends user's message to chatbase.
 * @param {Object} ctx Context of a message
 * @param {Object?} params additional params
 * @param {Boolean?} handled true if bot recognized the message, and false
 *  if doesn't. True is set by default.
 * @param {String?} intent of the sent message. Current scene as default
 * @returns {Promise} that resolves chatbase.Message object
 */
function track(ctx, { handled = true, intent = 'current' }) {
  let msg = chatbase.newMessage()
    .setUserId(ctx.from.id)
    .setTimestamp(ctx.message.date) // Only unix epochs with Millisecond precision
    .setMessage(ctx.message.text) // the message sent by either user or agent
    .setMessageId(ctx.message.message_id)
    .setIntent(intent === 'current' ? ctx.scene.current.id : intent)
    .setAsTypeUser() // sets the message as type user

  if (!handled)
    msg.setAsNotHandled();

  return msg.send()
    .catch(err => {
      console.error('chatbase:', err)
    })
}

exports.track = track
/**
 * Can be used instead of track as middleware for telegraf.
 * @param {Object} ctx Context of a message
 * @param {Function} next func in chain
 */
exports.telegrafMiddleware = (ctx, next) => {
  // call them in different threads
  track(ctx)
  next()
}
