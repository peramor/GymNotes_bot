const Scene = require('telegraf/scenes/base')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const moment = require('moment')
const userDb = require('../db/controllers/user.controller')

const historyScene = new Scene('history')

const makeMessage = async function (tgId, date) {
  let message = `<b>Дата:</b> ${moment(date).format('DD.MM.YYYY')}\n`

  let trains = await userDb.getTrainsByDate(tgId, date)

  trains.forEach((t, i) => {
    if (i > 0)
      message = message.concat(`——————————————\n`);

    message = message.concat(`\n<b>Время:</b> ${Math.round(moment.duration(moment(t.dateEnd).diff(t.dateStart)).asMinutes())} мин\n`)

    let sortedExercises = t.exercises.sort((a, b) => {
      if (a.group > b.group)
        return -1
      if (a.group < b.group)
        return 1
      return 0
    })

    let groups = []
    sortedExercises.forEach(e => groups.indexOf(e.group) === -1 && groups.push(e.group))

    for (let i = 0; i < groups.length; i++) {
      message += `\n<b>${groups[i]}</b>`

      for (let j = 0; j < sortedExercises.length; j++) {
        let exercise = sortedExercises[j]

        if (exercise.group === groups[i]) {
          message += `\n${exercise.name}\n`

          if (exercise.format === 'weight,count')
            exercise.repeats.forEach(repeat => {
              message += `${repeat.weight}x${repeat.count}, `
            })
          else if (exercise.format === 'count')
            exercise.repeats.forEach(repeat => {
              message = message.concat(`${repeat.count}, `)
            })
          else exercise.repeats.forEach(repeat => {
            message = message.concat(`${repeat.time}, `)
          })

          message = message.replace(/,\s*$/, '')
          message += '\n'
        }
      }
    }
  })

  return message
}

const dict = { 1: 'Пн', 2: 'Вт', 3: 'Ср', 4: 'Чт', 5: 'Пт', 6: 'Сб', 7: 'Вс' }

const makeInlineKeyboard = async function (tgId, date) {
  let trains = await userDb.getTrains(tgId)

  let thisWeekTrainings = [],
    previousWeeksTrainings = [],
    nextWeeksTrainings = []

  const weekDay = moment(date).isoWeekday()
  const week = moment(date).isoWeek()

  trains.forEach(t => {
    const trainingWeek = moment(t.dateStart).isoWeek()

    if (trainingWeek === week)
      thisWeekTrainings.push(t)
    else if (trainingWeek < week)
      previousWeeksTrainings.push(t)
    else
      nextWeeksTrainings.push(t)
  })

  let dayButtons = []
  let weekButtons = []

  thisWeekTrainings.forEach(t => {
    let buttonText, buttonData

    const trainingWeekDay = moment(t.dateStart).isoWeekday()

    if (trainingWeekDay === weekDay)
      buttonText = '·' + dict[trainingWeekDay] + '·'
    else
      buttonText = dict[trainingWeekDay]

    buttonData = t.dateStart

    const button = Markup.callbackButton(buttonText, buttonData)

    if (dayButtons.map(b => b.text).indexOf(buttonText) === -1)
      dayButtons.unshift(button)
  })

  if (previousWeeksTrainings.length > 0)
    weekButtons.push(Markup.callbackButton('< Пред. нед.', previousWeeksTrainings[0].dateStart))

  if (nextWeeksTrainings.length > 0)
    weekButtons.push(Markup.callbackButton('След. нед. >', nextWeeksTrainings[nextWeeksTrainings.length - 1].dateStart))

  return Markup.inlineKeyboard([dayButtons, weekButtons])
}

historyScene.enter(ctx => {
  userDb.getTrains(ctx.from.id)
    .then(res => {
      if (res.length === 0) {
        ctx.reply('У тебя пока нет тренировок')
        return ctx.scene.enter('rest')
      }

      makeMessage(ctx.from.id, res[0].dateStart)
        .then(mes => {
          makeInlineKeyboard(ctx.from.id, res[0].dateStart)
            .then(keyboard => {
              return ctx.replyWithHTML(mes, keyboard.extra())
            })
        })
    })
})

historyScene.on('callback_query', ctx => {
  const date = ctx.callbackQuery.data

  makeMessage(ctx.from.id, date)
    .then(mes => {
      makeInlineKeyboard(ctx.from.id, date)
        .then(keyboard => {
          return ctx.editMessageText(mes, Extra.HTML().markup(keyboard))
        })
    })
})

historyScene.hears(/Начать тренировку/gi, ctx => {
  ctx.session.train = {
    dateStart: moment().format(),
    exercises: {}
  }
  return ctx.scene.enter('groups')
})

historyScene.hears(/Назад/gi, ctx => {
  return ctx.scene.enter('rest')
})

module.exports = historyScene