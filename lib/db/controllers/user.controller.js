const mongoose = require('mongoose')
const moment = require('moment')

const mongoUrl = `mongodb://${process.env.MONGO_HOST || '127.0.0.1'}:${process.env.MONGO_PORT || 27017}/gym_notes`

mongoose.connect(mongoUrl, err => {
  if (err) {
    console.error('mongo:connect', err)
    process.exit(-1)
  }
})

// Importing model.
let User = require('../models/user.model')

/**
 * Transforms incomming object to database object.
 * @param {Object} data incomming train object
 * @return {Object} object for insertion to database
 */
let mapTrain = function (data) {
  let output = {
    dateStart: data.dateStart,
    dateEnd: data.dateEnd,
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
        break
      default:
        outputExercise.format = 'weight,count'
        repMapper = (r) => { return { weight: r.weight, count: r.count } }
        break
    }
    outputExercise.repeats = exercise.repeats.map(repMapper)
    output.exercises.push(outputExercise)
  })

  return output
}

/**
 * Create new user in database.
 * @param {String} tgId telegram id of new user
 * @return {Promise} that resolves mongo model of new user
 */
let createUser = function (tgId) {
  let user = new User({
    tgId,
    exerciseList: [],
    trains: [],
    creationDate: moment().format()
  })
  return user.save()
    .then(() => user)
}

/**
 * Adds new train to user's document.
 * @param {String} tgId user's telegram id
 * @param {String} train object to insert to db
 * @return {Promise} that will resolve user document
 * @public
 */
let addTrain = function (tgId, train) {
  return User.findOne({ tgId })
    .then(user => {
      if (!user)
        return createUser(tgId)
      return user
    })
    .then(user => {
      goodTrain = mapTrain(train)

      user.trains.push(goodTrain)
      extractUniqItems(user.exerciseList, goodTrain.exercises)

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
  for (let newItem of newList) {
    let isUniq = true;
    for (let baseItem of baseList)
      if (newItem.name === baseItem.name) {
        isUniq = false;
        break;
      }
    if (isUniq)
      baseList.push(newItem);
  }
}

/**
 * Returns user's exercises
 * @param {String} tgId User's Telegram Id
 * @param {String} group Name of muscle group
 * @return {Promise} Promise that will resolve array of user's exercise names
 */
const getUserExercises = function (tgId, group) {
  return User.findOne({ tgId })
    .then(user => {
      if (!user || !user.exerciseList) return null

      let exercises = []

      user.exerciseList.forEach(e => {
        if (e.group === group)
          exercises.push(e)
      })
      
      return exercises
    })
}

/**
 * Returns user's exercises
 * @param {String} tgId User's Telegram Id
 * @param {String} exercise Name of exercise
 * @return {Promise} Promise that will resolve array of repeats
 */
let getLastResults = function (tgId, exercise) {
  return User.findOne({ tgId })
    .then(user => {
      if (!user || !user.trains) return null

      const trains = user.trains.reverse()

      for (let i = 0; i < trains.length; i++) {
        const lastResult = trains[i].exercises.find(e => e.name === exercise && e.repeats.length > 0)
        if (lastResult) return lastResult.repeats
      }

      return null
  })
}

exports.addTrain = addTrain
exports.createUser = createUser
exports.getUserExercises = getUserExercises
exports.getLastResults = getLastResults