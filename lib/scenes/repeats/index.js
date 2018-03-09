const Scene = require('telegraf/scenes/base')
const enter = require('./enter')
const { changeExercise, saveRepeat, editRepeat } = require('./text-handlers')
const { endTrain } = require('../../utils/session-manager')

const repeatsScene = new Scene('repeats')

repeatsScene.enter(enter)

repeatsScene.hears(/Сменить упражнение/gi, changeExercise)

repeatsScene.hears(/Завершить тренировку/gi, endTrain)

repeatsScene.on('text', saveRepeat)

repeatsScene.on('edited_message', editRepeat)

module.exports = repeatsScene