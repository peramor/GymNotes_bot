const Scene = require('telegraf/scenes/base')
const enter = require('./enter')
const { startTrain, showPrevTrains } = require('./text-handlers')
const cbQueryHandler = require('./cb-handlers')

const restScene = new Scene('rest')

restScene.enter(enter)

restScene.hears('Начать тренировку', startTrain)

restScene.hears('Посмотреть предыдущие тренировки', showPrevTrains)

restScene.on('callback_query', cbQueryHandler)

module.exports = restScene