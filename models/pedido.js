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
  },
  cliente: {
    type: Schema.Types.ObjectId,
    ref: 'clientes'
  },
  itens: [{
    codigo: { type: String, required: true },
    descricao: String
  }]
}, { timestamps: true })

model.pre('find', function(next) {
  this.populate('cliente', 'nome documento')
  next()
})

mongoose.model('pedidos', model)
