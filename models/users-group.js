var mongoose = require('mongoose')
var Schema = mongoose.Schema

var model = new Schema({
  name: {
    type: String,
    required: true
  }
})

mongoose.model('usersgroups', model)
