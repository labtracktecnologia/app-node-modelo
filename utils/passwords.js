var bcrypt = require('bcrypt')
var SALT_WORK_FACTOR = 10

module.exports.compare = function (candidatePassword, password, cb) {
  bcrypt.compare(candidatePassword, password, function (err, isMatch) {
    if (err) return cb(err)
    cb(null, isMatch)
  })
}

module.exports.compareSync = function (candidatePassword, password) {
  return bcrypt.compareSync(candidatePassword, password)
}

module.exports.update = function (next) {
  var user = this
  if (!user.isModified('password')) return next()
  bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
    if (err) return next(err)
    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err)
      user.password = hash
      next()
    })
  })
}
