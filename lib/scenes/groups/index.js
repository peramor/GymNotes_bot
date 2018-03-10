const Scene = require('telegraf/scenes/base')
const enter = require('./enter')
const { selectGroup } = require('./text-handlers')
const { endTrain } = require('../../utils/session-manager')

const groupsScene = new Scene('groups')

groupsScene.enter(enter)

groupsScene.hears(/(Спина|Грудь|Ноги|Руки|Плечи|Пресс)/gi, selectGroup)

groupsScene.hears(/Завершить тренировку/gi, async ctx => await endTrain(ctx))

module.exports = groupsScene
