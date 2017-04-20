var mongoose = require('mongoose')
var Schema = mongoose.Schema
var updatePassword = require('../utils/passwords').update

var model = new Schema({
  username: {
    type: String,
    required: true,
    index: { name: 'username_unique_key', unique: true }
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  permissions: [String],
  tenancy: String
})

model.pre('save', updatePassword)

mongoose.model('users', model)
