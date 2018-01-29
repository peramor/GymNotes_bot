const Scene = require('telegraf/scenes/base')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const userDb = require('../db/controllers/user.controller')

const selectExerciseScene = new Scene('selectExercise')

selectExerciseScene.enter(ctx => {
  let message = 'Отправляй подходы в формате '
  switch (ctx.session.exercise.format) {
    case 'weight,count':
      message = message.concat('«повторения-вес»')
      break
    case 'count':
      message = message.concat('«повторения»')
      break
    case 'time':
      message = message.concat('«минуты:секунды»')
      break
  }

  userDb.getLastResults(ctx.from.id, ctx.session.exercise.name)
    .then(res => {
      if (res) {
        let previousWorkout = `Результаты прошлой тренировки\nКоличество подходов: ${res.length}\n`
        res.forEach(r => {
          previousWorkout = previousWorkout.concat(`${r.count}x${r.weight} `)
        })
        ctx.reply(previousWorkout)  
      }
      ctx.reply(message, Extra.markup(Markup.keyboard(['Завершить упражнение'])))
    })
})

const reg = new RegExp(/^([0-9]{1,3})[-,/x\s]([0-9]{1,3})$/)
selectExerciseScene.hears(reg, ctx => {
  const data = ctx.message.text.match(reg)
  ctx.session.exercise.repeats.push({ count: data[1], weight: data[2] })
})

selectExerciseScene.hears('Завершить упражнение', ctx => {
  ctx.session.train.exercises.push({
    repeats: ctx.session.exercise.repeats,
    name: ctx.session.exercise.name,
    group: ctx.session.exercise.group
  })
  ctx.session.exercise.repeats = []
  ctx.session.exercise.name = ""
  ctx.scene.enter('selectGroup')
})

module.exports = selectExerciseScene