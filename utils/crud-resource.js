const mongoose = require('mongoose')
const errorCallback = require('./error-callback')
const requiredPermission = require('./required-permission')
const parseParam = require('./parse-param')

module.exports = function (resource, app) {

  const permission = typeof resource === 'object' ? resource.permission : undefined
  resource = typeof resource === 'object' ? resource.resource : resource
  const model = mongoose.model(resource)
  console.info(`Mapeado o serviço/model ${resource}`)

  const findAll = function (req, resp) {
    let query = parseParam(req.query.query, { regex: true })
    let columns = parseParam(req.query.fields, { schema: model.schema })
    let options = {
      sort: parseParam(req.query.sort),
      limit: req.query.limit ? new Number(req.query.limit) : 25,
      skip: req.query.offset ? new Number(req.query.offset) : 0
    }
    model.count(query).then(function (val) {
      resp.set('X-Total-Count', val)
      resp.status((options.limit + options.skip) >= val ? 200 : 206)
      return model.find(query, columns, options)
    }).then(function (data) {
      resp.json(data)
    }).catch(errorCallback(resp))
  }

  const findOne = function (req, resp) {
    model.findById(req.params.id).then(function (data) {
      if (!data) {
        return Promise.reject({
          model: resource,
          id: req.params.id,
          error: "Registro não encontrado"
        })
      } else {
        resp.json(data)
      }
    }).catch(errorCallback(resp))
  }

  const insert = function (req, resp) {
    model.create(req.body).then(function (data) {
      resp.status(201).json(data)
    }).catch(errorCallback(resp))
  }

  const update = function (req, resp) {
    model.findById(req.params.id).then(function (data) {
      if (!data) {
        return Promise.reject({
          model: resource,
          id: req.params.id,
          error: "Registro não encontrado"
        })
      } else {
        data.set(req.body)
        return data.save()
      }
    }).then(function (updated) {
      resp.json(updated)
    }).catch(errorCallback(resp))
  }

  const remove = function (req, resp) {
    model.remove({ _id: req.params.id }).then(function () {
      resp.sendStatus(204)
    }, errorCallback(resp))
  }

  const sendOptions = function (req, resp) {
    resp.set({
      'Content-Type': 'application/schema+json'
    }).json({
      model: model.jsonSchema(),
      methods: {
        GET: [{
          url: `/api/${resource}`,
          params: ['query', 'fields', 'sort', 'limit', 'offset']
        }, {
          url: `/api/${resource}/:id`
        }],
        POST: {
          url: `/api/${resource}`
        },
        PUT: {
          url: `/api/${resource}/:id`
        },
        DELETE: {
          url: `/api/${resource}/:id`
        }
      }
    })
  }

  if (!app) {
    return function (app) {
      app.route(`/api/${resource}`)
        .get(requiredPermission(permission), findAll)
        .post(requiredPermission(permission), insert)
        .options(sendOptions)
      app.route(`/api/${resource}/:id`)
        .get(requiredPermission(permission), findOne)
        .delete(requiredPermission(permission), remove)
        .put(requiredPermission(permission), update)
    }
  } else {
    app.route(`/api/${resource}`)
      .get(requiredPermission(permission), findAll)
      .post(requiredPermission(permission), insert)
      .options(sendOptions)
    app.route(`/api/${resource}/:id`)
      .get(requiredPermission(permission), findOne)
      .delete(requiredPermission(permission), remove)
      .put(requiredPermission(permission), update)
  }
}
