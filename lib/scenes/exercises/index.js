const Scene = require('telegraf/scenes/base')
const enter = require('./enter')
const { showMore, selectExercise } = require('./text-handlers')
const { endTrain } = require('../../utils/session-manager')

const exercisesScene = new Scene('exercises')

exercisesScene.enter(enter)

exercisesScene.hears('Больше', showMore)

exercisesScene.hears(/Сменить группу мышц/gi, ctx => ctx.scene.enter('groups'))

exercisesScene.hears(/Завершить тренировку/gi, async ctx => await endTrain(ctx))

exercisesScene.on('text', selectExercise)

module.exports = exercisesScene
