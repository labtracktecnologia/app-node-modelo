const http = require('http')
const app = require('./config/express')
const database = require('./config/database')
const argv = require('./config/minimist')
const os = require('os')

database(argv.db)

http.createServer(app).listen(argv.port, function () {
  let ifaces = os.networkInterfaces()
  Object.keys(ifaces).forEach(function (dev) {
    ifaces[dev].forEach(function (details) {
      if (details.family === 'IPv4' || details.family === 'IPv6') {
        console.info(`Servidor iniciado em ${details.address} na porta ${argv.port}`)
      }
    })
  })
})
