const mongoose = require('mongoose')
const Schema = mongoose.Schema

let userSchema = new Schema({
  tgId: String,
  trains: [{
    date: Date,
    trainType: String,
    groups: [String],
    exercises: [{
      code: String,
      group: String,
      name: String,
      mes: String,
      repeats: [{
        weight: Number,
        count: Number
      }]
    }]
  }]
})

module.exports = userSchema