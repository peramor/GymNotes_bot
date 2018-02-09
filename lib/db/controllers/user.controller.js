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

  for (let property in data.exercises) {
    let outputExercise = {
      name: property,
      group: data.exercises[property].group,
      repeats: []
    }

    let repMapper
    switch (data.exercises[property].format) {
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
    outputExercise.repeats = data.exercises[property].repeats.map(repMapper)
    output.exercises.push(outputExercise)
  }

  return output
}

/**
 * Create new user in database.
 * @param {String} tgId telegram id of new user
 * @return {Promise} that resolves mongo model of new user
 */
let createUser = async function (tgId) {
  let user = await User.findOne({ tgId })
  if (user) return

  let newUser = new User({
    tgId,
    exerciseList: [],
    trains: [],
    creationDate: moment().format()
  })
  return await newUser.save()
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
      let goodTrain = mapTrain(train)

      user.trains.push(goodTrain)
      extractUniqItems(user.exerciseList, goodTrain.exercises)

      return user.save()
        .catch(err => {
          console.error(user.tgId, err);
        })
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
const getExercises = function (tgId, group) {
  return User.findOne({ tgId })
    .then(user => {
      if (!user.exerciseList) return null

      let exercises = []

      user.exerciseList.forEach(e => {
        if (e.group === group)
          exercises.push(e)
      })

      return exercises
    })
}

/**
 * Returns user's trainings history
 * @param {String} tgId User's Telegram Id
 * @return {Promise} Promise that will resolve array of user's trainings
 */
const getTrains = function (tgId) {
  return User.findOne({ tgId })
    .then(user => {
      if (!user || !user.trains) return null

      return user.trains.reverse()
    })
}
/**
 * Returns user's trainings history
 * @param {String} tgId User's Telegram Id
 * @param {String} date Date of wanted trainings
 * @return {Promise} Promise that will resolve array of user's trainings on the date
 */
const getTrainsByDate = function (tgId, date) {
  return User.findOne({ tgId })
    .then(user => {
      if (!user.trains) return null

      let trains = user.trains.filter(t => moment(t.dateStart).isSame(moment(date), 'day'))
      return trains
    })
}

/**
 * Returns user's exercises
 * @param {String} tgId User's Telegram Id
 * @param {String} exercise Name of exercise
 * @return {Promise} Promise that will resolve array of repeats
 */
let getLastResults = function (tgId, exercise) {
  return getTrains(tgId)
    .then(trains => {
      if (!trains) return null

      for (let i = 0; i < trains.length; i++) {
        const lastResult = trains[i].exercises.find(e => e.name === exercise && e.repeats.length > 0)
        if (lastResult) return {
          repeats: lastResult.repeats,
          date: trains[i].dateStart
        }
      }

      return null
    })
}

exports.addTrain = addTrain
exports.createUser = createUser
exports.getExercises = getExercises
exports.getTrains = getTrains
exports.getLastResults = getLastResults
exports.getTrainsByDate = getTrainsByDate
