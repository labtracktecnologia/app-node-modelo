const crudResource = require('../utils/crud-resource')

const resources = [{
  resource: 'clientes',
  permission: { POST: 'user', PUT: 'user', DELETE: 'admin' }
}, 'produtos']

module.exports = function (app) {
  resources.forEach(function (res) {
    crudResource(res, app)
  })
}
