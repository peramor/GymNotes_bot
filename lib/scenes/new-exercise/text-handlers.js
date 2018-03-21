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

let cancel = ctx => ctx.scene.enter('exercises')

module.exports = {
  selectFormat,
  cancel
}