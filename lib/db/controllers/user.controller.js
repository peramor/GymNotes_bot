const mongoose = require('mongoose')
const mongoUrl = `mongodb://${MONGO_HOST || '127.0.0.1'}:${MONGO_PORT || 27017}/gym_notes`

mongoose.connect(mongoUrl, err => {
  console.error('mongo:connect', err)
  process.exit(-1)
})

// Importing model.
let User = require('../models/user.model')

/**
 * Creates new user in the database.
 * @param {Object} user object
 * @return {Promise} that will resolve ???
 */
let createUser = function (user) {
  return User.create(user)
}

/**
 * Transforms incomming object to database object.
 * @param {Object} data incomming train object
 * @return {Object} object for insertion to database
 */
let mapTrain = function (data) {
  let output = {
    dateStart: train.dateStart,
    dateEnd: train.dateEnd,
    exercises: []
  }

  data.exercises.forEach(exercise => {
    let outputExercise = {
      group: exercise.group,
      name: exercise.name,
      repeats: []
    }
    let repMapper
    switch (exercise.format) {
      case 'count':
        outputExercise.format = 'count'
        repMapper = (r) => { return { count: r.count } }
        break
      case 'time':
        outputExercise.format = 'time'
        repMapper = (r) => { return { time: r.time } }
      default:
        outputExercise.format = 'weight,count'
        repMapper = (r) => { return { weight: r.weight, count: r.count } }
        break
    }
    outputExercise.repeats.map(repMapper)
    output.exercises.push(outputExercise)
  })

  return output
}

/**
 * Adds new train to user's document.
 * @param {String} tgId user's telegram id
 * @param {String} train object to insert to db
 * @return {Promise} that will resolve user document
 */
let addTrain = function (tgId, train) {
  return User.findOne({ tgId })
    .then(user => {
      goodTrain = mapTrain(train)

      user.trains.push(goodTrain)

      return user.save()
    })
}

let exerciseList = [
  {}
]

module.exports = {
  addTrain
}
