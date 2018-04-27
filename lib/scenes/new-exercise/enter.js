const Markup = require('telegraf/markup')
const enterMessage = 'Выбери формат записи результатов для нового упражнения'
const enterKeyboard = ['Вес-повторения', 'Повторения', 'Время', '🔙 Отмена']

module.exports = function (ctx) {
  ctx.reply(enterMessage, Markup.keyboard(enterKeyboard).extra())
}
