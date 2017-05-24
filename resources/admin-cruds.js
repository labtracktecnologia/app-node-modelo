const crudResource = require('../utils/crud-resource')

const resources = [{
  resource: 'users',
  permission: 'admin'
}, {
  resource: 'usersgroups',
  permission: 'admin'
}]

module.exports = function (app) {
  resources.forEach(function (res) {
    crudResource(res, app)
  })
}
