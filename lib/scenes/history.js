const Scene = require('telegraf/scenes/base')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const moment = require('moment')
const userDb = require('../db/controllers/user.controller')

const historyScene = new Scene('history')

const makeMessage = function (train) {
  let message = `<b>Дата:</b> ${moment(train.dateStart).format('DD.MM.YYYY (ddd)')}\n`
  message = message.concat(`<b>Время:</b> ${moment.duration(moment(train.dateEnd).diff(train.dateStart)).asMinutes()} мин\n`)

  let sortedExercises = train.exercises.sort((a, b) => {
    if (a.group > b.group)
      return -1
    if (a.group < b.group)
      return 1
    return 0
  })

  let groups = []
  sortedExercises.forEach(e => groups.indexOf(e.group) === -1 && groups.push(e.group))

  for (let i = 0; i < groups.length; i++) {
    message += `\n<b>${groups[i]}</b>\n`

    for (let j = 0; j < sortedExercises.length; j++) {
      let exercise = sortedExercises[j]

      if (exercise.group === groups[i]) {
        message += `\n${exercise.name}\n`

        if (exercise.format === 'weight,count')
          exercise.repeats.forEach(repeat => {
            message += `${repeat.count}x${repeat.weight}, `
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

  return message
}

const dict = { 1: 'Пн', 2: 'Вт', 3: 'Ср', 4: 'Чт', 5: 'Пт', 6: 'Сб', 7: 'Вс' }

const makeInlineKeyboard = function (trains, date) {

  const weekDay = moment(date).isoWeekday()
  const week = moment(date).isoWeek()

  let thisWeekTrainings = [],
    previousWeeksTrainings = [],
    nextWeeksTrainings = []

  let dayButtons = []
  let weekButtons = []

  trains.forEach(t => {
    if (t.week === week)
      thisWeekTrainings.push(t)
    else if (t.week < week)
      previousWeeksTrainings.push(t)
    else
      nextWeeksTrainings.push(t)
  })

  thisWeekTrainings.forEach(t => {
    let buttonText, buttonData

    if (t.weekDay === weekDay)
      buttonText = '·' + dict[t.weekDay]
    else
      buttonText = dict[t.weekDay]

    buttonData = t.dateStart
    const button = Markup.callbackButton(buttonText, buttonData)

    if (dayButtons.map(b => b.text).indexOf(buttonText) === -1)
      dayButtons.unshift(button)
  })

  if (previousWeeksTrainings.length > 0)
    weekButtons.push(Markup.callbackButton('< Пред. нед.', previousWeeksTrainings[0].dateStart))

  if (nextWeeksTrainings.length > 0)
    weekButtons.push(Markup.callbackButton('След. нед. >', nextWeeksTrainings[-1].dateStart))

  return Markup.inlineKeyboard([dayButtons, weekButtons])
}

historyScene.enter(ctx => {
  userDb.getTrains(ctx.from.id)
    .then(res => {
      if (!res) {
        ctx.reply('У тебя пока нет тренировок')
        return ctx.scene.enter('rest')
      }

      let trains = res.map(t => ({
        dateStart: t.dateStart,
        dateEnd: t.dateEnd,
        exercises: t.exercises,
        weekDay: moment(t.dateStart).isoWeekday(),
        week: moment(t.dateStart).isoWeek()
      }))

      ctx.session.trains = [... trains]

      let message = makeMessage(trains[0])
      let inlineKeyboard = makeInlineKeyboard(trains, trains[0].dateStart)

      return ctx.reply('Чтобы получить данные за определённый день, отправь дату в формате "дд.мм.гггг"', Markup
        .keyboard([
          'Начать тренировку',
          'Назад'
        ])
        .extra())
        .then(() => {
          return ctx.replyWithHTML(message, inlineKeyboard.extra())
        })
    })
})

historyScene.on('callback_query', ctx => {
  const date = ctx.callbackQuery.data 

  const trains = ctx.session.trains

  const train = trains.find(t => moment(t.dateStart).isSame(date))

  const message = makeMessage(train)
  const inlineKeyboard = makeInlineKeyboard(trains, date)

  return ctx.editMessageText(message, Extra.HTML().markup(inlineKeyboard))
})

historyScene.hears('Начать тренировку', ctx => {
  ctx.session.trains = []
  return ctx.scene.enter('startWorkout')
})

historyScene.hears('Назад', ctx => {
  ctx.session.trains = []
  return ctx.scene.enter('rest')
})

module.exports = historyScene