var mongoose = require('mongoose')
var errorCallback = require('./error-callback')
var parseParam = require('./parse-param')

module.exports = function (collection, app) {

  var model = mongoose.model(collection)

  var findAll = function (req, resp) {
    var query = parseParam(req.query.query, { regex: true })
    var columns = parseParam(req.query.fields, { schema: model.schema })
    var options = {
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

  var findOne = function (req, resp) {
    model.findById(req.params.id).then(function (data) {
      if (!data) {
        return Promise.reject({
          model: collection,
          id: req.params.id,
          error: "Registro não encontrado"
        })
      } else {
        resp.json(data)
      }
    }).catch(errorCallback(resp))
  }

  var insert = function (req, resp) {
    model.create(req.body).then(function (data) {
      resp.status(201).json(data)
    }).catch(errorCallback(resp))
  }

  var update = function (req, resp) {
    model.findById(req.params.id).then(function (data) {
      if (!data) {
        return Promise.reject({
          model: collection,
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

  var remove = function (req, resp) {
    model.remove({ _id: req.params.id }).then(function () {
      resp.sendStatus(204)
    }, errorCallback(resp))
  }

  var sendOptions = function (req, resp) {
    resp.set({
      'Content-Type': 'application/schema+json'
    }).json({
      model: model.jsonSchema(),
      methods: {
        GET: [{
          url: `/api/${collection}`,
          params: ['query', 'fields', 'sort', 'limit', 'offset']
        }, {
          url: `/api/${collection}/:id`
        }],
        POST: {
          url: `/api/${collection}`
        },
        PUT: {
          url: `/api/${collection}/:id`
        },
        DELETE: {
          url: `/api/${collection}/:id`
        }
      }
    })
  }

  if (!app) {
    return function (app) {
      app.route(`/api/${collection}`)
        .get(findAll)
        .post(insert)
        .options(sendOptions)
      app.route(`/api/${collection}/:id`)
        .get(findOne)
        .delete(remove)
        .put(update)
    }
  } else {
    app.route(`/api/${collection}`)
      .get(findAll)
      .post(insert)
      .options(sendOptions)
    app.route(`/api/${collection}/:id`)
      .get(findOne)
      .delete(remove)
      .put(update)
  }
}
