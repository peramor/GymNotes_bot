const Scene = require('telegraf/scenes/base')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const moment = require('moment')
const userDb = require('../db/controllers/user.controller')
const isForgetful = require('../is-forgetgul')

const groupsScene = new Scene('groups')

groupsScene.enter(ctx => ctx.reply('Выбери группу мышц', Markup
  .keyboard([
    ['Спина', 'Грудь'], ['Ноги',
    'Руки'], ['Плечи', 'Пресс'],
    ['🔚 Завершить тренировку'] // 🔙
  ]).extra()
))

groupsScene.on('text', async (ctx, next) => {
  if (isForgetful(ctx)) {
    await ctx.reply('Предыдущая тренировка была завершена автоматически')
    await endTrain(ctx)
    }
  else
    await next()
})

groupsScene.hears(/(Спина|Грудь|Ноги|Руки|Плечи|Пресс)/gi, ctx => {
  ctx.session.exercise = {
    group: ctx.message.text,
    repeats: []
  }

  ctx.scene.enter('exercises')
})

groupsScene.hears(/Завершить тренировку/gi, async ctx => await endTrain(ctx))

/**
 * End training and if ctx.session.train.exercises is not empty write it to the db
 * @param {Object} ctx - user's context
 */
let endTrain = async function (ctx) {
  if (ctx.session.train.exercises.length > 0) {
    ctx.session.train.dateEnd = moment(ctx.session.train.lastMessageDate).format()
    await userDb.addTrain(ctx.from.id, ctx.session.train)
  }

  ctx.session.train = {}
  ctx.scene.enter('rest')
}

module.exports = groupsScene
