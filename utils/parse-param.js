const parseAttribute = function (attribute, regex) {
  if (typeof attribute === 'string') {
    let date = new Date(attribute)
    if (!isNaN(date.getTime())) {
      return date
    } else {
      return regex ? new RegExp(attribute, 'gi') : attribute
    }
  } else if (typeof attribute === 'object') {
    for (att in attribute) {
      attribute[att] = parseAttribute(attribute[att], regex)
    }
  }
  return attribute
}

const parseColumns = function (columns, schema) {
  if (!columns) return []
  let result = []
  let cols = columns.split(',')
  for (pos in cols) {
    if (schema.obj[cols[pos]] && schema.obj[cols[pos]].select !== false) {
      result.push(cols[pos])
    }
  }
  return result
}

const parseParam = function (param, config = { regex: false, schema: null }) {
  if (config.schema)
    return parseColumns(param, config.schema)
  return parseAttribute(JSON.parse(param || '{}'), config.regex)
}

module.exports = parseParam
