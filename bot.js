const Telegraf = require('telegraf')
const RedisSession = require('telegraf-session-redis') // keeps all meta of sessions in Redis
const glob = require('glob') // force a folder for getting all names of its files inside
const path = require('path')
const Stage = require('telegraf/stage')
const userDb = require('./lib/db/controllers/user.controller')
const { enter, leave } = Stage
const seed = require('./lib/utils/exercises') // add default objects to exercises db
const prettyjson = require('prettyjson') // prints debug messages
const stat = require('./lib/utils/stat') // collects statistics
const md5 = require('md5') // for hashing token

const REDIS_HOST = process.env.TELEGRAM_SESSION_HOST || '127.0.0.1'
const REDIS_PORT = process.env.TELEGRAM_SESSION_PORT || 6379
const BOT_TOKEN = process.env.TG_BOT_TOKEN
const BOT_WEBHOOK_HOST = process.env.BOT_WEBHOOK_HOST || '127.0.0.1'
const BOT_WEBHOOK_PORT = process.env.BOT_WEBHOOK_PORT || 3000

if (!BOT_TOKEN) {
  console.error('Bot token is not found. Environment variable TG_BOT_TOKEN is required')
  process.exit(-1)
}

const bot = new Telegraf(BOT_TOKEN)
const session = new RedisSession({
  store: {
    host: REDIS_HOST,
    port: REDIS_PORT
  }
})
let stage = new Stage()
/**
 * For sending data about each accepted message to chatbase with
 * purpose to get usefull insides.
 */
stage.use(stat.middleware)

// array of paths to scenes
let scenesPaths = glob.sync(path.join(__dirname, 'lib/scenes/*.js'))
scenesPaths.forEach(scenePath => stage.register(require(scenePath)))

/**
 * For saving all session meta, and do not lose it
 * if bot will restart.
 */
bot.use(session.middleware())
/**
 * For navigation between different scenes, make transitions
 * which is described in State Mashine (docs/sm-map).
 */
bot.use(stage.middleware())


bot.start(async ctx => {
  await userDb.createUser(ctx.from.id)
  ctx.scene.enter('rest')
})

bot.hears('debug', ctx => ctx.reply(prettyjson.render(ctx.session)))

/**
 * Prints error, Sends statistic, Replies to client
 * @param {String} err.message will be sent to client
 * @param {Object} err.ctx - context of request
 */
bot.catch(async (err) => {
  if (err.unhandled) {
    err.ctx.reply(err.message)
    await stat.track(err.ctx, { handled: false })
    await stat.trackBotReply(err.ctx, err.message)
  } else {
    console.error('telegraf:', err)
  }
})

if (process.env.TG_DEBUG_MODE) {
  bot.startPolling()
  console.log("bot has been started in LP mode")
  return
} else {
  // Start https webhook
  bot.startWebhook(`/bot/${md5(BOT_TOKEN)}`, null, BOT_WEBHOOK_PORT, BOT_WEBHOOK_HOST, (err) => {
    if (err) {
      console.error("Bot hasn't been started in 'Webhooks' mode", err)
      process.exit(-1)
    }
    console.log("bot has been started in 'Webhooks' mode")
  })
}