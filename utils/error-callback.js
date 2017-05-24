module.exports = function (response, status = 500) {
  return function (error) {
    if (error.name === 'ValidationError') {
      response.status(400).json(error)
    } else {
      response.status(error.model ? 404 : status).json(error)
    }
  }
}
