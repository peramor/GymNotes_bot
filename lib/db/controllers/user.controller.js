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
 * Create new user in database.
 * @param {String} tgId telegram id of new user
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
let addTrain = async function (tgId, train) {
  let user = await User.findOne({ tgId })

  user.trains.push(train)

  extractUniqItems(user.exerciseList, train.exercises)

  return await user.save()
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
const getExercises = async function (tgId, group) {
  let user = await User.findOne({ tgId })

  let exercises = []

  user.exerciseList.forEach(e => {
    if (e.group === group)
    exercises.push(e)
  })
  
  return exercises
}

/**
 * Returns user's trainings history
 * @param {String} tgId User's Telegram Id
 * @return {Promise} Promise that will resolve array of user's trainings
 */
const getTrains = async function (tgId) {
  let user = await User.findOne({ tgId })

  return user.trains.reverse()
}

/**
 * Returns user's trainings history
 * @param {String} tgId User's Telegram Id
 * @param {String} date Date of wanted trainings
 * @return {Promise} Promise that will resolve array of user's trainings on the date
 */
const getTrainsByDate = async function (tgId, date) {
  let user = await User.findOne({ tgId })

  let trains = user.trains.filter(t => moment(t.dateStart).isSame(moment(date), 'day'))
  return trains
}

/**
 * Returns user's exercises
 * @param {String} tgId User's Telegram Id
 * @param {String} exercise Name of exercise
 * @return {Promise} Promise that will resolve array of repeats
 */
let getLastResults = async function (tgId, exercise) {
  let trains = await getTrains(tgId)

  if (trains)
    for (let i = 0; i < trains.length; i++) {
      const lastResult = trains[i].exercises.find(e => e.name === exercise)

      if (lastResult) return {
        repeats: lastResult.repeats,
        date: trains[i].dateStart
      }
    }

  return null
}

exports.addTrain = addTrain
exports.createUser = createUser
exports.getExercises = getExercises
exports.getTrains = getTrains
exports.getLastResults = getLastResults
exports.getTrainsByDate = getTrainsByDate
