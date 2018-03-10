let selectGroup = function (ctx) {
  ctx.session.exercise = {
    group: ctx.message.text,
    repeats: []
  }

  ctx.scene.enter('exercises')
}

module.exports = {
  selectGroup
}