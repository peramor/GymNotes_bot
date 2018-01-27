const mongoose = require('mongoose')
const Schema = mongoose.Schema

let exerciseSchema = new Schema({
  group: String,
  name: String,
  format: {
    type: String,
    enum: ['weight,count', 'count', 'time'].
    default: 'weight,count'
  }
})

let exerciseModel = mongoose.model('exercise', exerciseSchema)

module.exports = exerciseModel