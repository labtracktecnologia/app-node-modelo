var http = require('http')
var app = require('./config/express')
var database = require('./config/database')

database('mongodb://localhost/sistema')

var port = process.env.PORT || 8080

http.createServer(app).listen(port, function () {
  console.log('Servidor iniciado na porta', port)
})
