var mongoose = require('mongoose')
var Schema = mongoose.Schema

var model = new Schema({
  documento: {
    type: String,
    match: [/([0-9]{3}\.[0-9]{3}\.[0-9]{3}-[0-9]{2})|([0-9]{2}\.[0-9]{3}\.[0-9]{3}\/[0-9]{4}-[0-9]{2})/, "Formato do documento inválido"],
    required: true
  },
  nome: {
    type: String,
    required: true
  }, 
  tenant: {
    user: Schema.Types.ObjectId,
    group: Schema.Types.ObjectId
  }
})

mongoose.model('clientes', model)
