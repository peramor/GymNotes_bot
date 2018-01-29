const mongoose = require('mongoose')

const mongoUrl = `mongodb://${process.env.MONGO_HOST || '127.0.0.1'}:${process.env.MONGO_PORT || 27017}/gym_notes`

mongoose.connect(mongoUrl, err => {
  if (err) {
    console.error('mongo:connect', err)
    process.exit(-1)
  }
})

let Exercise = require('../models/exercise.model')

/**
 * Returns one of default exercises.
 * @param {String} exercise Name of exercise.
 * @return {any} Found exercise.
 */
let getExercise = function (exercise) {
  return Exercise.findOne({ name: exercise  })
}

/**
 * Returns a list of default exercises of one muscle group.
 * @param {String} group Name of muscle group.
 * @return {Array} Array of group exercises.
 */
let getByGroup = function (group) {
  return Exercise.find({ group })
}

exports.getByGroup = getByGroup
exports.getExercise = getExercise
