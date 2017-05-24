function getUserPermissions(user) {
  return (user && user.user && user.user.permissions) || []
}

function requiredPermission(permission) {
  switch (typeof permission) {
    case 'string':
      return function (req, resp, next) {
        if (req.method === 'OPTIONS') {
          next()
        }
        console.info(`Requisitando permissão de ${permission}`)
        console.info('Usuário com as permissões:', getUserPermissions(req.user))

        if (getUserPermissions(req.user).indexOf(permission) != -1) {
          next()
        } else {
          resp.sendStatus(401)
        }
      }
    case 'object':
      return function (req, resp, next) {
        if (req.method === 'OPTIONS') {
          next()
        }
        console.info(`Requisitando permissão de ${permission[req.method]} em ${req.method}`)
        console.info('Usuário com as permissões:', getUserPermissions(req.user))

        if (!permission[req.method]) {
          next()
        } else if (getUserPermissions(req.user).indexOf(permission[req.method]) != -1) {
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
