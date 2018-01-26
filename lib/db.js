const mg = require('mongoose')
const mongoConfig = require('config').get('mongo')

mg.connect(mongoConfig.url, mongoConfig.options, err => {
  console.error('mongo:connect', err)
  process.exit(-1)
})

// Importing schemas.
let userSchema = require('./schemas/user.schema')
let exerciseSchema = require('./schemas/exercise.schema')

// Creating models from schemas.
let User = mg.model('User', userSchema)
let Exercise = mg.model('Exercise', exerciseSchema)

/**
 * Creates new user in the database.
 * @param {Object} user object
 * @return {Promise} that will resolve ???
 */
let createUser = function (user) {
  return User.create(user)
}

exports.createUser = createUser
