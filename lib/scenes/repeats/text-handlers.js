const { endTrain } = require('../../utils/session-manager')
const FormatException = require('../../exceptions/format-exception')
const { regWeightCount, regCount, regTime } = require('./utils')

/**
 * Delete exercise from an array if user hasn't write any repeats
 * @param {Object} ctx context of user's request
 */
let deleteEmptyExercise = function (ctx) {
  // Get the exercise of current name and group
  let exercises = ctx.session.train.exercises
  let exercise = exercises.find(ex =>
    ex.name === ctx.session.train.currentExercise
    && ex.group === ctx.session.train.currentGroup)

  // If there were no repeats added then delete this exercise from an array
  if (exercise.repeats.length === 0) {
    let index = exercises.findIndex(ex => ex === exercise)
    exercises.splice(index, 1)
  }
}

/**
 * Check if exercise is empty and direct user to the exercises scene
 * @param {Object} ctx context of user's request
 */
let changeExercise = function (ctx) {
  deleteEmptyExercise(ctx)
  ctx.scene.enter('exercises')
}

/**
 * Check if exercise is empty and direct user to the rest scene
 * @param {Object} ctx context of user's request
 */
let endTraining = async function (ctx) {
  deleteEmptyExercise(ctx)
  await endTrain(ctx)
}

/**
 * Check format and save to the repeats array
 * @param {Object} ctx context of user's request
 */
let saveRepeat = async function (ctx) {
  // Get the exercise of current name and group
  let exercises = ctx.session.train.exercises
  let exercise = exercises.find(ex =>
    ex.name === ctx.session.train.currentExercise
    && ex.group === ctx.session.train.currentGroup)

  let format = exercise.format
  let repeat = ctx.message.text

  if (format === 'weight,count' && repeat.match(regWeightCount)) {
    let data = repeat.split(/[-–—]/)
    exercise.repeats.push({
      weight: parseInt(data[0].replace(',', '.')),
      count: parseInt(data[1]),
      userMessageId: ctx.message.message_id
    })
  }
  else if (format === 'count' && repeat.match(regCount)) {
    exercise.repeats.push({
      count: parseInt(repeat),
      userMessageId: ctx.message.message_id
    })
  }
  else if (format === 'time' && repeat.match(regTime)) {
    const data = repeat.split(/[:]/)
    exercise.repeats.push({
      time: parseInt(data[0]) * 60 + parseInt(data[1]),
      userMessageId: ctx.message.message_id
    })
  }
  else {
    throw new FormatException(ctx, format)
    return
  }

  let botMessage = await ctx.reply(`Подход записан: ${repeat}`)
  exercise.repeats[exercise.repeats.length - 1].botMessageId = botMessage.message_id

  return
}

module.exports = {
  changeExercise,
  endTraining,
  saveRepeat
}