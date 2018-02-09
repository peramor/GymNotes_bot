const Telegraf = require('telegraf')
const RedisSession = require('telegraf-session-redis')
const glob = require('glob')
const path = require('path')
const Stage = require('telegraf/stage')
const userDb = require('./lib/db/controllers/user.controller')
const { enter, leave } = Stage
const seed = require('./exercises')
const prettyjson = require('prettyjson') // prints debug messages

console.log("bot has been started")

const session = new RedisSession({
  store: {
    host: process.env.TELEGRAM_SESSION_HOST || '127.0.0.1',
    port: process.env.TELEGRAM_SESSION_PORT || 6379
  }
})

const bot = new Telegraf(process.env.TG_BOT_TOKEN)

const stage = new Stage()

const scenesPaths = glob.sync(path.join(__dirname, 'lib/scenes/*.js'))
scenesPaths.forEach(path => stage.register(require(path)))

bot.use(session.middleware())
bot.use(stage.middleware())

bot.start(ctx => {
  userDb.createUser(ctx.from.id)
    .then(ctx.scene.enter('rest'))
})

bot.hears(/debug/, ctx => ctx.reply(prettyjson.render(ctx.session)))

bot.startPolling()