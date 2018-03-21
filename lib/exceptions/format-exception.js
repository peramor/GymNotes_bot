const UnhandledException = require('./unhandled-exception')
const { formatDict } = require('../utils/dictionaries')

class FormatException extends UnhandledException {
  /**
   * @param {Object} ctx context of client's request
   * @param {String} format format of the exercise
   */
  constructor(ctx, format) {
    super(ctx)
    this.message = 'Неправильный формат ввода. Пример: ' +
      formatDict[format].example
  }
}

module.exports = FormatException