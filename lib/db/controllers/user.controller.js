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

/**
 * Extracts uniq items from second array and puts it to the first one.
 * @param {Array} baseList base list to where uniq items should be added
 * @param {Array} newList incomming list needs to be filtered
 * @return {Array} list populated by new uniq items
 */
let extractUniqItems = function (baseList, newList) {
  let uniqList = [];
  let counter = 0;
  for (let newItem of newList) {
    let isUniq = true;
    for (let baseItem of baseList) {
      counter++;
      if (newItem.name === baseItem.name) {
        isUniq = false;
        break;
      }
    }
    if (isUniq)
      uniqList.push(newItem);
  }
  return baseList.concat(uniqList)
}

module.exports = {
  addTrain,
  extractUniqItems
}
