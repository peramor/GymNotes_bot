if (process.env.SEED_MONGO === "no")
  return;

const mongoose = require('mongoose')
const mongoUrl = `mongodb://${process.env.MONGO_HOST || '127.0.0.1'}:${process.env.MONGO_PORT || 27017}/gym_notes`

mongoose.connect(mongoUrl, err => {
  if (err) {
    console.error('mongo:connect', err)
    process.exit(-1)
  }
})

const Exercise = require('../db/models/exercise.model')


// List of exercises with format 'count'
const count = {
  'Спина': [
    'Подтягивания',
    'Гиперэкстензии'
  ],
  'Грудь': [
    'Отжимания',
    'Отжимания на брусьях'
  ],
  'Ноги': [
    'Приседания'
  ],
  'Руки': [
    'Отжимания',
    'Отжимания на брусьях'
  ],
  'Плечи': [
    'Отжимания в стойке на руках'
  ],
  'Пресс': [
    'Скручивания'
  ]
}

// List of exercises with format 'weight,count'
const weightcount = {
  'Спина': [
    'Подтягивания с отягощением',    
    'Становая тяга',
    'Тяга штанги в наклоне',
    'Тяга верхнего блока к груди',
    'Тяга нижнего блока к поясу',
    'Тяга гантели в наклоне'
  ],
  'Грудь': [
    'Жим штанги лёжа',
    'Жим штанги лёжа на наклонной скамье',    
    'Жим гантелей лёжа',
    'Жим гантелей лёжа на наклонной скамье',
    'Отжимания на брусьях с отягощением',
    'Пуловер с гантелью',
    'Разведение рук с гантелями лёжа',
    'Сведение рук в тренажёре (бабочка)',
    'Кроссовер'
  ],
  'Ноги': [
    'Приседания со штангой на плечах',
    'Приседания в гакк-тренажёре',
    'Жим ногами в тренажёре',
    'Разгибание ног в тренажёре',
    'Сгибание ног в тренажёре'
  ],
  'Руки': [
    'Сгибание рук со штангой стоя',
    'Сгибание рук на скамье Скотта',
    'Сгибание рук с гантелями стоя',
    'Разгибание рук на блоке стоя',
    'Французский жим лёжа',
    'Жим штанги узким хватом'
  ],
  'Плечи': [
    'Армейский жим',
    'Разведение гантелей в стороны',
    'Тяга штанги к подбородку',
    'Жим Арнольда',
    'Подъем рук с гантелями перед собой',
    'Разведение гантелей в стороны в наклоне'
  ]
}

// List of exercises with format 'time'
const time = {
  'Пресс': [
    'Планка'
  ]
}

const exercisesToInsert = []

for (let property in count) {
  if (count.hasOwnProperty(property))
    count[property].forEach(exercise => {
      exercisesToInsert.push({
        group: property,
        name: exercise,
        format: 'count'
      })
    })
}

for (let property in weightcount) {
  if (weightcount.hasOwnProperty(property))
    weightcount[property].forEach(exercise => {
      exercisesToInsert.push({
        group: property,
        name: exercise,
        format: 'weight,count'
      })
    })
}

for (let property in time) {
  if (time.hasOwnProperty(property))
    time[property].forEach(exercise => {
      exercisesToInsert.push({
        group: property,
        name: exercise,
        format: 'time'
      })
    })
}

// Exercises collection in database should be empty
Exercise.insertMany(exercisesToInsert)