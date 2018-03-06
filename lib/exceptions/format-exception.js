const UnhandledException = require('./unhandled-exception')
const dict = {
  'weight,count': { format: '«вес-повторения»', example: '50-8' },
  'count': { format: '«повторения»', example: '10' },
  'time': { format: '«минуты:секунды»', example: '2:30' }
}

class FormatException extends UnhandledException {
  /**
   * @param {Object} ctx - context of client's request
   */
  constructor(ctx) {
    super(ctx)
    this.message = 'Неправильный формат ввода. Пример: ' +
      dict[ctx.session.exercise.format].example
  }
}

module.exports = FormatException