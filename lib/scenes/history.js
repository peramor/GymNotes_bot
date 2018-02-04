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

const makeInlineKeyboard = function (trains, active) {
  let texts = ['<', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс', '>']
  let datas = ['prev', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'next']
  
}

historyScene.enter(ctx => {
  userDb.getTrains(ctx.from.id)
    .then(res => {
      if (!res) {
        ctx.reply('У тебя пока нет тренировок')
        return ctx.scene.enter('rest')
      }

      ctx.session.trains = res

      let message = makeMessage(ctx.session.trains[0])

      return ctx.reply('Чтобы получить данные за определённый день, отправь дату в формате "дд.мм.гггг"', Markup
        .keyboard([
          'Начать тренировку',
          'Назад'
        ])
        .extra())
        .then(() => { 
          return ctx.reply(message, Extra.HTML().markup(m => m.inlineKeyboard([
            //m.callbackButton('<', 'prev'),
            m.callbackButton('Пн', 'Mon'),
            m.callbackButton('Вт', 'Mon'),
            m.callbackButton('Ср', 'Mon'),
            m.callbackButton('Чт', 'Mon'),
            m.callbackButton('Пт', 'Mon'),
            m.callbackButton('Сб', 'Mon'),
            m.callbackButton('Вс', 'Mon'),
            //m.callbackButton('>', 'Mon')
          ]))) 
        })
    })
})

historyScene.on('callback_query', ctx => {
  if (ctx.callbackQuery.data === 'prev')
    index += 1
  else index -= 1

  changeMessage(trains[index])

  return ctx.editMessageText(message, Extra.HTML().markup((m) => m.inlineKeyboard([
    m.callbackButton('Пред.', 'prev', index === trains.length - 1),
    m.callbackButton('След.', 'next', index === 0)
  ])))
})

historyScene.hears('Начать тренировку', ctx => {
  ctx.session.trains = {}
  return ctx.scene.enter('startWorkout')
})

historyScene.hears('Назад', ctx => {
  ctx.session.trains = {}
  return ctx.scene.enter('rest')
})

module.exports = historyScene