function requiredPermission(permission) {
  switch (typeof permission) {
    case 'string':
      return function (req, resp, next) {
        console.info(`Requisitando permissão de ${permission}`)

        if (req.user && req.user.permissions && req.user.permissions.indexOf(permission) != -1) {
          next()
        } else {
          resp.sendStatus(401)
        }
      }
    case 'object':
      return function (req, resp, next) {
        console.info(`Requisitando permissão de ${permission[req.method]} em ${req.method}`)

        if (!permission[req.method]) {
          next()
        } else if (req.user && req.user.permissions && req.user.permissions.indexOf(permission[req.method]) != -1) {
          next()
        } else {
          resp.sendStatus(401)
        }
      }
    default:
      return function (req, resp, next) {
        next()
      }
  }
}

module.exports = requiredPermission
