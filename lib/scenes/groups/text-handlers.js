/**
 * Directs user to the groups scene and writes selected group to the ctx.session.train
 * @param {Object} ctx context of user's request
 */
let selectGroup = function (ctx) {
  ctx.session.train.currentGroup = ctx.message.text
  return ctx.scene.enter('exercises')
}

module.exports = {
  selectGroup
}