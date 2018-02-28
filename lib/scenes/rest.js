const Scene = require('telegraf/scenes/base')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const moment = require('moment')
const userDb = require('../db/controllers/user.controller')

const restScene = new Scene('rest')

restScene.enter(async ctx => {
  let trains = await userDb.getTrains(ctx.from.id)

  let keyboard = ['Начать тренировку']

  if (trains.length > 0)
    keyboard.push('Посмотреть предыдущие тренировки')

  ctx.reply('Отдыхаем', Markup.keyboard(keyboard).extra())
})

restScene.hears('Начать тренировку', ctx => {
  ctx.session.train = {
    dateStart: moment().format(),
    exercises: []
  }

  ctx.scene.enter('groups')
})

restScene.hears('Посмотреть предыдущие тренировки', async ctx => {
  let trains = await userDb.getTrains(ctx.from.id)

  let message = await makeMessage(ctx.from.id, trains[0].dateStart)

  let inlineKeyboard = await makeInlineKeyboard(ctx.from.id, trains[0].dateStart)

  ctx.replyWithHTML(message, inlineKeyboard.extra())
})

// ----------------------------------

const makeMessage = async function (tgId, date) {
  let message = `<b>Дата:</b> ${moment(date).format('DD.MM.YYYY')}\n`

  let trains = await userDb.getTrainsByDate(tgId, date)

  trains.forEach((t, i) => {
    if (i > 0)
      message = message.concat(`———————————\n`);

    message = message.concat(`\n<b>Время:</b> ${Math.ceil(moment.duration(moment(t.dateEnd).diff(t.dateStart)).asMinutes())} мин\n`)

    let groups = []
    t.exercises.forEach(e => groups.indexOf(e.group) === -1 && groups.push(e.group))

    for (let i = 0; i < groups.length; i++) {
      message += `\n<b>${groups[i]}</b>`

      for (let j = 0; j < t.exercises.length; j++) {
        let exercise = t.exercises[j]

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
            const minutes = Math.floor(repeat.time / 60)
            const seconds = repeat.time % 60
            message = message.concat(`${minutes}:${(seconds < 10 ? '0' : '') + seconds}, `)
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

    if (trainingWeekDay === weekDay) {
      buttonText = '·' + dict[trainingWeekDay] + '·'
      buttonData = 'current'
    }
    else {
      buttonText = dict[trainingWeekDay]
      buttonData = t.dateStart
    }

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

restScene.on('callback_query', async ctx => {
  try {
    const date = ctx.callbackQuery.data

    if (date !== 'current') {
      let message = await makeMessage(ctx.from.id, date)

      let inlineKeyboard = await makeInlineKeyboard(ctx.from.id, date)

      return await ctx.editMessageText(message, Extra.HTML().markup(inlineKeyboard))
    }
  }
  catch (error) {
    console.log(error)
    return
  }
})

module.exports = restScene