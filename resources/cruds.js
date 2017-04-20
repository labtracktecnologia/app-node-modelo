const crudResource = require('../utils/crud-resource')

const resources = ['users', 'clientes', 'produtos', 'pedidos']

module.exports = function(app) {
  resources.forEach(function(res) {
    crudResource(res, app)
  })
}
