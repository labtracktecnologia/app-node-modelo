const passport = require("passport")
const jwtPassport = require("passport-jwt")
const jwt = require("jsonwebtoken")
const mongoose = require('mongoose')
const passwords = require('../utils/passwords')

const ExtractJwt = jwtPassport.ExtractJwt
const JwtStrategy = jwtPassport.Strategy

const userModel = mongoose.model('users')

const params = {
  secretOrKey: 'senhaparasermodificada',
  jwtFromRequest: ExtractJwt.versionOneCompatibility({ authScheme: 'Bearer' })
}

const findUser = function(username) {
  return userModel.findOne({ username: username }, '-_id').select('username permissions tenancy')
}

module.exports = function (app) {
  passport.use(
    new JwtStrategy(params, function (payload, done) {
      findUser(payload.username).then(function (user) {
        if (user) {
          done(null, user)
        } else {
          done(new Error("Usuário não encontrado"))
        }
      }, function (error) {
        done(error)
      })
    })
  )

  app.use(passport.initialize())
  app.use('/api', passport.authenticate("jwt", { session: false }))

  app.post('/login', function (req, resp) {
    userModel.findOne({ username: req.body.username }, ['password'])
      .then(function (user) {
        return passwords.compareSync(req.body.password, user.password)
      })
      .then(function (isMatch) {
        if (isMatch) {
          return findUser(req.body.username)
        } else {
          return Promise.reject("Usuário/Senha incorretos")
        }
      })
      .then(function (data) {
        resp.json({
          token: jwt.sign({ username: data.username }, params.secretOrKey, { expiresIn: 24 * 60 * 60 }),
          data
        })
      })
      .catch(function (error) {
        resp.status(401).json({ "message": error })
      })
  })

  app.get('/api/@me', function (req, resp) {
    resp.json(req.user)
  })
}
