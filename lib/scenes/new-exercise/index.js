const Scene = require('telegraf/scenes/base')
const enter = require('./enter')
const { selectFormat, cancel } = require('./text-handlers')

const newExerciseScene = new Scene('newExercise')

newExerciseScene.enter(enter)

newExerciseScene.hears(/(Вес-повторения|Повторения|Время)/gi, selectFormat)

newExerciseScene.hears(/Отмена/gi, cancel)

module.exports = newExerciseScene
