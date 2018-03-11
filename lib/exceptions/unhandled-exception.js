class UnhandledException {
  /**
   * @param {Object} ctx context of client's request
   */
  constructor(ctx) {
    this.ctx = ctx;
    this.message = 'Не понимаю'
    this.unhandled = true
  }
}

module.exports = UnhandledException