const Markup = require('telegraf/markup')

module.exports = function (ctx) {
  ctx.reply('Выбери группу мышц', Markup.keyboard([
    ['Спина', 'Грудь'], ['Ноги',
      'Руки'], ['Плечи', 'Пресс'],
    ['🔚 Завершить тренировку'] // 🔙
  ]).extra())
}