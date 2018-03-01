let token = process.env.METRICS_TOKEN // token for connecting to yandex appmetrica
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


var request = require('request');

var BOTAN_URL = 'https://api.botan.io/track';
var DEFAULT_NAME = 'Message';

module.exports = function (apikey) {
    var token = apikey;
    return {
        /**
         * @param {Object} message
         * @param {String} [name='Message']
         * @param {Function} [callback]
         */
        track: function (message, name, callback) {
            if (typeof name === 'function') {
                callback = name;
                name = DEFAULT_NAME;
            }

            request({
                method: 'POST',
                url: BOTAN_URL,
                qs: {
                    token: token,
                    uid: message.from.id,
                    name: name || DEFAULT_NAME
                },
                json: message
            }, function (error, response, body) {
                if (callback) {
                    callback(error, response, body);
                }
            });
        }
    };
};
