const Telegraf = require('telegraf')
// const session = require('telegraf/session')
const Stage = require('telegraf/stage')
const Scene = require('telegraf/scenes/base')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const exercises = require('./exercises')
const { enter, leave } = Stage
const moment = require('moment')
const fs = require('fs');

// launch redis using docker:
// docker run -d --name some-redis -p 6379:6379 redis

const RedisSession = require('telegraf-session-redis')
const session = new RedisSession({
  store: {
    host: process.env.TELEGRAM_SESSION_HOST || '127.0.0.1',
    port: process.env.TELEGRAM_SESSION_PORT || 6379
  }
})

const bot = new Telegraf(process.env.TG_BOT_TOKEN)

const restScene = new Scene('rest')
restScene.enter(ctx => ctx.reply('Пока отдыхаем.', Extra.markup(Markup.keyboard(['Начать тренировку']))))
restScene.hears('Начать тренировку', ctx => {
  ctx.scene.enter('startWorkout')
  ctx.session.train = {
    date: moment().format(),
    exercices: []
  }
})

const startWorkoutScene = new Scene('startWorkout')
startWorkoutScene.enter(ctx => ctx.reply('Выбери группу мышц.', Extra.markup(Markup.keyboard(['Грудь', 'Спина', 'Ноги', 'Руки', 'Плечи', 'Завершить тренировку']))))
startWorkoutScene.hears('Завершить тренировку', ctx => {
  fs.writeFileSync(`notebook/train-${ctx.session.train.date}.json`, JSON.stringify(ctx.session.train))
  ctx.scene.enter('rest')
})

startWorkoutScene.on('message', ctx => {
  const groupName = ctx.message.text
  if (exercises[groupName]) {
    ctx.session.exercise = {
      group: groupName,
      repeats: []
    }
    ctx.scene.enter('selectGroup')
  }
  else {
    ctx.reply('Ошибка')
    ctx.scene.enter('startWorkout')
  }
})

const selectGroupScene = new Scene('selectGroup')
selectGroupScene.enter(ctx => {
  ctx.reply('Выбери упражнение.', Extra.markup(Markup.keyboard(exercises[ctx.session.exercise.group])))
})
selectGroupScene.hears('Назад', ctx => {
  ctx.scene.enter('startWorkout')
})
selectGroupScene.on('message', ctx => {
  const exercise = ctx.message.text
  if (exercises[ctx.session.exercise.group].indexOf(exercise) > -1) {
    ctx.session.exercise.name = exercise
    ctx.scene.enter('selectExercise')
  }
  else {
    ctx.reply('Ошибка')
    ctx.scene.enter('selectGroup')
  }
})

let store = [];

const selectExerciseScene = new Scene('selectExercise')
selectExerciseScene.enter(ctx => {
  ctx.reply('Отправляй подходы в формате «вес(кг) повторения(раз)».', Extra.markup(Markup.keyboard(['Завершить упражнение'])))
})
selectExerciseScene.hears(/[0-9]{1,3} [0-9]{1,3}/g, ctx => {
  let data = ctx.message.text.split(' ');
  ctx.session.exercise.repeats.push({weight: data[0], count: data[1]});
})
selectExerciseScene.hears('Завершить упражнение', ctx => {
  ctx.session.train.exercices.push(ctx.session.exercise)
  ctx.scene.enter('selectGroup')
})

const inputRepeatitionsScene = new Scene('inputRepetitions');
inputRepeatitionsScene.enter(ctx => ctx.reply)

const stage = new Stage([startWorkoutScene, selectGroupScene, selectExerciseScene, restScene])

// bot.use(session())
bot.use(session.middleware())
bot.use(stage.middleware())
bot.start(enter('rest'))

bot.startPolling()