const { submitRepeats } =require('../../utils/session-manager')
const { regWeightCount, regCount, regTime } = require('./utils')
const FormatException = require('../../exceptions/format-exception')

let changeExercise = function (ctx) {
  submitRepeats(ctx)
  ctx.scene.enter('exercises')
}

let saveRepeat = async function (ctx) {
  let format = ctx.session.exercise.format
  let repeat = ctx.message.text
  let repeats = ctx.session.exercise.repeats

  if (format === 'weight,count' && repeat.match(regWeightCount)) {
    let data = repeat.split(/[-–—]/)
    repeats.push({
      weight: Number(data[0].replace(',', '.')),
      count: Number(data[1]),
      userMessageId: ctx.message.message_id
    })
  }
  else if (format === 'count' && repeat.match(regCount)) {
    repeats.push({
      count: Number(repeat),
      userMessageId: ctx.message.message_id
    })
  }
  else if (format === 'time' && repeat.match(regTime)) {
    const data = repeat.split(/[:]/)
    repeats.push({
      time: parseInt(data[0]) * 60 + parseInt(data[1]),
      userMessageId: ctx.message.message_id
    })
  }
  else {
    throw new FormatException(ctx)
    return
  }

  let botMessage = await ctx.reply(`Подход записан: ${repeat}`)
  repeats[repeats.length - 1].botMessageId = botMessage.message_id
  
  return
}

let editRepeat = async function (ctx) {
  let format = ctx.session.exercise.format
  let editedRepeat = ctx.editedMessage.text

  let repeats = ctx.session.exercise.repeats
  let index = repeats.findIndex(r => r.userMessageId === ctx.editedMessage.message_id)

  if (index === -1) return ctx.reply('Подходы предыдущих упражнений изменять нельзя')

  let chatId = ctx.editedMessage.chat.id
  let botMessageId = repeats[index].botMessageId

  if (format === 'weight,count' && editedRepeat.match(regWeightCount)) {
    const data = editedRepeat.split(/[-–—]/)
    repeats[index].weight = Number(data[0].replace(',', '.'))
    repeats[index].count = Number(data[1])
  }
  else if (format === 'count' && editedRepeat.match(regCount)) {
    repeats[index].count = Number(editedRepeat)
  }
  else if (format === 'time' && editedRepeat.match(regTime)) {
    const data = editedRepeat.split(/[:]/)
    repeats[index].time = parseInt(data[0]) * 60 + parseInt(data[1])
  }
  else {
    throw new FormatException(ctx)
    return
  } 
  
  return ctx.telegram.editMessageText(chatId, botMessageId, null, `Подход записан: ${editedRepeat} (изм.)`)
}

module.exports = {
  changeExercise,
  saveRepeat,
  editRepeat
}