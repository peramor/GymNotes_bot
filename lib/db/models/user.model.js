const mongoose = require('mongoose')
const Schema = mongoose.Schema

let userSchema = new Schema({
  tgId: String,
  exerciseList: [{
    name: String,
    group: String,
    format: {
      type: String,
      enum: ['weight,count', 'count', 'time'],
      default: 'weight,count'
    }
  }],
  trains: [{
    dateStart: Date,
    dateEnd: Date,
    exercises: [{
      group: String,
      name: String,
      format: {
        type: String,
        enum: ['weight,count', 'count', 'time'],
        default: 'weight,count'
      },
      repeats: [{
        weight: Number,
        count: Number,
        time: String
      }]
    }]
  }]
})

let userModel = mongoose.model('user', userSchema)

module.exports = userModel