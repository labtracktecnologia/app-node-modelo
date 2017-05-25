const passport = require("passport")
const jwtPassport = require("passport-jwt")
const jwt = require("jsonwebtoken")
const mongoose = require('mongoose')
const passwords = require('../utils/passwords')

const ExtractJwt = jwtPassport.ExtractJwt
const JwtStrategy = jwtPassport.Strategy

const userModel = mongoose.model('users')
const groupModel = mongoose.model('usersgroups')
const errorCallback = require('../utils/error-callback')

const params = {
  secretOrKey: 'senhaparasermodificada',
  expiresTime: 30 * 60,
  jwtFromRequest: ExtractJwt.versionOneCompatibility({ authScheme: 'Bearer' })
}

const findUser = function (username) {
  return userModel.findOne({ username: username }).select('username permissions group')
}

module.exports = function (app) {
  passport.use(
    new JwtStrategy(params, function (payload, done) {
      findUser(payload.username).then(function (user) {
        if (user) {
          done(null, {
            user: user,
            group: user.group
          })
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

  app.post('/join', function (req, resp) {
    userModel.count()
      .then(function (count) {
        if (count === 0) {
          return userModel.create({
            username: req.body.username,
            password: req.body.password,
            permissions: ['admin', 'user']
          })
        } else {
          return groupModel.create(req.body.group)
            .then(function (group) {
              return userModel.create({
                username: req.body.username,
                password: req.body.password,
                permissions: ['user'],
                group: group
              })
            })
        }
      })
      .then(function (data) {
        resp.status(201).json({ msg: 'Usuário criado com sucesso' })
      }).catch(errorCallback(resp))
  })

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
        resp.set('X-Token', jwt.sign({ username: data.username }, params.secretOrKey, { expiresIn: params.expiresTime }))
        resp.json({
          data
        })
      })
      .catch(errorCallback(resp, 401))
  })

  app.get('/api/auth/@me', function (req, resp) {
    resp.set('X-Token', jwt.sign({ username: req.user.user.username }, params.secretOrKey, { expiresIn: params.expiresTime }))
    resp.json(req.user.user)
  })
}
