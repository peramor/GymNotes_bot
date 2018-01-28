const Telegraf = require('telegraf')
const RedisSession = require('telegraf-session-redis')
// const glob = require('glob-promise')
const path = require('path')
const Stage = require('telegraf/stage')
const { enter, leave } = Stage

const session = new RedisSession({
  store: {
    host: process.env.TELEGRAM_SESSION_HOST || '127.0.0.1',
    port: process.env.TELEGRAM_SESSION_PORT || 6379
  }
})

const bot = new Telegraf(process.env.TG_BOT_TOKEN)

const stage = new Stage()

stage.register(require('./lib/scenes/rest'))
stage.register(require('./lib/scenes/select-exercise'))
stage.register(require('./lib/scenes/select-group'))
stage.register(require('./lib/scenes/start-workout'))

bot.use(session.middleware())

bot.use(stage.middleware())

// bot.use((ctx, next) => {
//   console.log(ctx)
//   next()
// })

bot.start(enter('rest'))
bot.startPolling()