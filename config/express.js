const express = require('express')
const morgan = require('morgan')
const consign = require('consign')
const bodyParser = require('body-parser')
const cors = require('cors')
const helmet = require('helmet')

const app = express()
app.use(express.static('./public'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cors({
  origin: "*",
  methods: "GET,OPTIONS,PUT,POST,DELETE",
  preflightContinue: true,
  optionsSuccessStatus: 200
}))
app.use(helmet({
  frameguard: {
    action: 'deny'
  }
}))
app.use(morgan('combined'))

consign()
  .include('models')
  .then('resources')
  .into(app)

module.exports = app
