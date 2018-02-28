let token = process.env.APP_METRICA_TOKEN // token for connecting to yandex appmetrica
if (!token) {
  module.exports = (ctx, next) => { next() } // this is needed if bot is used as middleware
  return
}

var botan = require('botanio')(token)

/**
 * Middleware which sends information for tracking to 
 *  yandex appmetrica.
 * @param {Object} ctx telegram context
 * @param {Function} next next function
 */
module.exports = function (ctx, next) {
  botan.track(ctx, 'Start')
} 