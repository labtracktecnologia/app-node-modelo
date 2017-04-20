var mongoose = require('mongoose')
var Schema = mongoose.Schema

var model = new Schema({
  codigo: {
    type: String,
    required: true
  },
  emissao: {
    type: Date,
    default: Date.now,
    required: true
  }
})

mongoose.model('pedidos', model)
