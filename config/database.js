const mongoose = require('mongoose')

mongoose.Promise = global.Promise
require('mongoose-schema-jsonschema')(mongoose)

module.exports = function (uri) {
  mongoose.connect(uri)
  mongoose.set('debug', true)
  mongoose.connection.on('connected', function () {
    console.log('Conectado ao MongoDB em', uri)
  })
  mongoose.connection.on('error', function (error) {
    console.log('Erro na conexão:', error)
  })
  mongoose.connection.on('disconnected', function () {
    console.log('Desconectado do MongoDB')
  })
  process.on('SIGINT', function () {
    mongoose.connection.close(function () {
      console.log('Aplicação terminada, conexão fechada')
      process.exit(0)
    })
  })
}
