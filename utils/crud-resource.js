const mongoose = require('mongoose')
const passport = require("passport")
const errorCallback = require('./error-callback')
const requiredPermission = require('./required-permission')
const parseParam = require('./parse-param')
const Router = require('express').Router

module.exports = function (resource, app) {

  const permission = typeof resource === 'object' ? resource.permission : undefined
  resource = typeof resource === 'object' ? resource.resource : resource
  const model = mongoose.model(resource)

  const resolveQuery = (req, query) => {
    query = query || parseParam(req.query.query, { regex: true })
    if (req.params.id) {
      query['_id'] = req.params.id
    }
    if (req.user) {
      query['$or'] = [
        { tenant: null },
        { 'tenant.user': req.user.user['_id'] },
        { 'tenant.group': req.user.group }
      ]
    }
    return query
  }

  const findAll = function (req, resp) {
    let query = resolveQuery(req)
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
    model.findOne(resolveQuery(req)).then(function (data) {
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
    let bean = req.body
    bean.tenant = req.user
    model.create(bean)
      .then(function (data) {
        return model.findById(data._id)
      })
      .then(function (data) {
        resp.status(201).json(data)
      })
      .catch(errorCallback(resp))
  }

  const update = function (req, resp) {
    model.findOne(resolveQuery(req)).then(function (data) {
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
    model.remove(resolveQuery(req)).then(function (data) {
      if (data.result.n) {
        resp.sendStatus(204)
      } else {
        return Promise.reject({
          model: resource,
          id: req.params.id,
          error: "Registro não encontrado"
        })
      }
    })
      .catch(errorCallback(resp))
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

  if (app) {
    routerMapper(app)
  } else {
    return routerMapper
  }

  function routerMapper(app) {
    app.options(`/api/${resource}`, sendOptions)
    app.use(`/api/${resource}`, Router()
      .use(passport.authenticate("jwt", { session: false }))
      .use(function (req, resp, next) {
        if (req.user) {
          resp.set('X-Token', jwt.sign({ username: req.user.user.username }, params.secretOrKey, { expiresIn: params.expiresTime }))
        }
      })
      .use(requiredPermission(permission))
      .get('/', findAll)
      .post('/', insert)
      .get('/:id', findOne)
      .delete('/:id', remove)
      .put('/:id', update))

    console.info(`Mapeado o serviço/model ${resource}`)
  }
}
