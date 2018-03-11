const Scene = require('telegraf/scenes/base')
const enter = require('./enter')
const { changeExercise, endTraining, saveRepeat, editRepeat } = require('./text-handlers')

const repeatsScene = new Scene('repeats')

repeatsScene.enter(enter)

repeatsScene.hears(/Сменить упражнение/gi, changeExercise)

repeatsScene.hears(/Завершить тренировку/gi, endTraining)

repeatsScene.on('text', saveRepeat)

module.exports = repeatsScene