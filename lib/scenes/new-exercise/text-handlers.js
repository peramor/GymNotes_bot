/**
 * Directs user to the repeats scene and writes format to the exercise
 * @param {Object} ctx context of user's request
 */
let selectFormat = function (ctx) {
  // Get the exercise that was added last 
  // No need to find because if the exercise is new it is added to the end of array
  let exercises = ctx.session.train.exercises
  let exercise = exercises[exercises.length - 1]

  switch (ctx.message.text) {
    case 'Вес-повторения':
      exercise.format = 'weight,count'
      break
    case 'Повторения':
      exercise.format = 'count'
      break
    case 'Время':
      exercise.format = 'time'
      break
  }
  return ctx.scene.enter('repeats')
}

/**
 * Removes last element of exercises, because it was added
 * in entering to the scene, and is not needed to be saved.
 * @param {Object} ctx context
 */
let cancel = ctx => {
  let cursor = ctx.session.train.exercises.length -1
  ctx.session.train.exercises.splice(cursor, 1)
  return ctx.scene.enter('exercises')
}

module.exports = {
  selectFormat,
  cancel
}