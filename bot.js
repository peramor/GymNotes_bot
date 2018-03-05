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

console.log("bot has been started")

let redisHost = process.env.TELEGRAM_SESSION_HOST || '127.0.0.1'
let redisPort = process.env.TELEGRAM_SESSION_PORT || 6379
let botToken = process.env.TG_BOT_TOKEN

if (!botToken) {
  console.error('Bot token is not found. Environment variable TG_BOT_TOKEN is required')
  process.exit(-1)
}

const bot = new Telegraf(botToken)
const session = new RedisSession({
  store: {
    host: redisHost,
    port: redisPort
  }
})
let stage = new Stage()
// array of paths to scenes
let scenesPaths = glob.sync(path.join(__dirname, 'lib/scenes/*.js'))
scenesPaths.forEach(scenePath => stage.register(require(scenePath)))

bot.use((ctx, next) => {
  return next()
})
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
/**
 * For sending data about each accepted message to chatbase with
 * purpose to get usefull insides.
 */
bot.use(stat.middleware)

bot.start(async ctx => {
  await userDb.createUser(ctx.from.id)
  ctx.scene.enter('rest')
})

bot.hears('debug', ctx => ctx.reply(prettyjson.render(ctx.session)))

bot.startPolling() 

bot.catch((err) => {
  console.error('telegraf:', err)
  // TODO: notify developers
})