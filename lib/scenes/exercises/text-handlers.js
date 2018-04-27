const Markup = require('telegraf/markup')
const userDb = require('../../db/controllers/user.controller')
const exerciseDb = require('../../db/controllers/exercise.controller')

/**
 * Sends user message with keyboard that contains user's and all default exercises
 * @param {Object} ctx context of user's request
 */
let showMore = async function (ctx) {
  let keyboard = []

  const exercises = ctx.session.train.exercises
  const group = ctx.session.train.currentGroup

  // if user has his own exercises from previous trainings, include them into keyboard and add 'more' button
  if (exercises.length > 0)
    for (let i = 0; i < exercises.length; i++)
      if (exercises[i].group === group)
        keyboard.push(exercises[i].name)

  // also incule all other user's exercises
  let userExercises = await userDb.getExercises(ctx.from.id, group)
  userExercises.map(e => e.name).forEach(e => keyboard.push(e))

  // also include all default exercises
  let allExercises = await exerciseDb.getByGroup(group)
  allExercises.map(e => e.name).forEach(e => keyboard.push(e))

  keyboard.push('🔙 Сменить группу мышц', '🔚 Завершить тренировку')
  keyboard = [... new Set(keyboard)]

  ctx.reply('Выбери упражнение или отправь свое', Markup.keyboard(keyboard).extra())
}

/**
 * Directs user to the repeats or the new-exercise scene
 * @param {Object} ctx context of user's request
 */
let selectExercise = async function (ctx) {
  if (ctx.message.text.match(/(Спина|Грудь|Ноги|Руки|Плечи|Пресс)/)) return

  // Remember name of the selected exercise to write repeats in relevant array element
  ctx.session.train.currentExercise = ctx.message.text

  // Check whether this exercise was performed in current training
  // if yes, go to repeats scene
  let repeatedExercise = ctx.session.train.exercises.find(e => 
    e.name === ctx.message.text
  && e.group === ctx.session.train.currentGroup)
  
  if (repeatedExercise)
    return ctx.scene.enter('repeats')

  let selectedExercise = {
    name: ctx.message.text,
    group: ctx.session.train.currentGroup,
    repeats: []
  }

  // Try to find selected exercise in user's exericises list
  let userExercise = await userDb.getExercises(ctx.from.id, selectedExercise.group)
    .then(res => { return res.find(e => e.name === selectedExercise.name) },
      err => {
        console.error('Error occured when fetching user exercises', err)
        return undefined
      })
  // Try to find selected exercise in default exericises list
  let defaultExercise = await exerciseDb.get(selectedExercise.name)
    .then(res => { return res },
      err => {
        console.error('Error occured when fetching default exercises', err)
        return undefined
      })
  // If exercise was found in user's or default list then grab it's format
  if (userExercise)
    selectedExercise.format = userExercise.format
  else if (defaultExercise && defaultExercise.group === selectedExercise.group)
    selectedExercise.format = defaultExercise.format

  // Add exercise to the end of exercises array
  ctx.session.train.exercises.push(selectedExercise)

  if (selectedExercise.hasOwnProperty('format') && selectedExercise.format)
    return ctx.scene.enter('repeats')
  else return ctx.scene.enter('newExercise')
}

module.exports = {
  showMore,
  selectExercise
}