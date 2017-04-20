var mongoose = require('mongoose')
var Schema = mongoose.Schema

var model = new Schema({
  codigo: {
    type: String,
    required: true
  },
  descricao: {
    type: String,
    required: true
  }
})

mongoose.model('produtos', model)
