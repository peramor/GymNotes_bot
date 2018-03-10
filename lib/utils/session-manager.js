const moment = require('moment')
const userDb = require('../db/controllers/user.controller')

/**
 * Check if user forgot to end training.
 * @param {Object} ctx User's context
 * @returns {boolean} true if last message was sent by user more than 60 min ago
 */
const isForgetful = function (ctx) {
  if (ctx.message && ctx.session && ctx.session.train && ctx.session.train.dateStart && ctx.session.train.lastMessageDate) {
    let lastMessageDate = ctx.session.train.lastMessageDate

    if (lastMessageDate) {
      let difference = moment(ctx.message.date, 'X').diff(moment(lastMessageDate), 'minutes')
  
      return difference > 60
    }
  
    let trainDateStart = ctx.session.train.dateStart
    let difference = moment(ctx.message.date, 'X').diff(moment(trainDateStart), 'minutes')
  
    return difference > 60
  }

  return false
}

/**
 * End training and save results to database.
 * @param {Object} ctx User's context
 */
const endTrain = async function (ctx) {
  submitRepeats(ctx)
  ctx.session.exercise = {}
  if (ctx.session && ctx.session.train && ctx.session.train.exercises && ctx.session.train.exercises.length > 0) {
    ctx.session.train.dateEnd = moment(ctx.session.train.lastMessageDate).format()
    await userDb.addTrain(ctx.from.id, ctx.session.train)
  }

  ctx.session.train = {}
  ctx.scene.enter('rest')
}

/**
 * Save repeats to ctx.session.train and clean ctx.session.exercise.
 * @param {Object} ctx User's context
 */
const submitRepeats = function (ctx) {
  if (ctx.session && ctx.session.exercise && ctx.session.train && ctx.session.train.exercises) {
    const exercise = ctx.session.exercise
    
    if (!exercise.hasOwnProperty('repeats') || exercise.repeats.length === 0)
      return
  
    let repeatedExercise = ctx.session.train.exercises.find(e => e.name === exercise.name)
    
    if (repeatedExercise) exercise.repeats.forEach(r => repeatedExercise.repeats.push(r))
    else {
      let exerciseObj = {
        name: exercise.name,
        group: exercise.group,
        format: exercise.format,
        repeats: []
      }
      exercise.repeats.forEach(r => exerciseObj.repeats.push(r))
  
      ctx.session.train.exercises.push(exerciseObj)
    }
  
    ctx.session.exercise.name = ''
    ctx.session.exercise.format = ''
    ctx.session.exercise.repeats = []
  }
}

exports.endTrain = endTrain

exports.submitRepeats = submitRepeats

exports.middleware = async (ctx, next) => {
  if (isForgetful(ctx)) {
    await ctx.reply('Предыдущая тренировка была завершена автоматически')
    await endTrain(ctx)
  }
  if (ctx.message && ctx.session && ctx.session.__scenes && ctx.session.__scenes.current !== 'rest')
    ctx.session.train.lastMessageDate = moment(ctx.message.date, 'X').format()

  await next()
}