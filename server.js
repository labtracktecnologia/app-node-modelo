const http = require('http')
const app = require('./config/express')
const database = require('./config/database')
const os = require('os')

database('mongodb://localhost/sistema')

const port = process.env.PORT || 8080

http.createServer(app).listen(port, function () {
  let ifaces = os.networkInterfaces()
  Object.keys(ifaces).forEach(function (dev) {
    ifaces[dev].forEach(function (details) {
      if (details.family === 'IPv4' || details.family === 'IPv6') {
        console.info(`Servidor iniciado em ${details.address} na porta ${port}`)
      }
    })
  })
})
