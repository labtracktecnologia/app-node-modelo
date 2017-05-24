const crudResource = require('../utils/crud-resource')

const resources = [{
  resource: 'pedidos',
  permission: { POST: 'user', PUT: 'user', DELETE: 'admin' }
}]

module.exports = function (app) {
  resources.forEach(function (res) {
    crudResource(res, app)
  })
}
