let selectFormat = function (ctx) {
  switch (ctx.message.text) {
    case 'Вес-повторения':
      ctx.session.exercise.format = 'weight,count'
      break
    case 'Повторения':
      ctx.session.exercise.format = 'count'
      break
    case 'Время':
      ctx.session.exercise.format = 'time'
      break
  }
  return ctx.scene.enter('repeats')
}

let cancel = ctx => ctx.scene.enter('exercises')

module.exports = {
  selectFormat,
  cancel
}