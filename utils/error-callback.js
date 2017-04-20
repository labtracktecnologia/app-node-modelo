module.exports = function (response) {
  return function (error) {
     console.log(error)
    if (error.name === 'ValidationError') {
      response.status(400).json(error)
    } else {
      response.status(error.model ? 404 : 500).json(error)
    }
  }
}
