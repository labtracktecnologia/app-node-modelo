module.exports = function (response) {
  return function (error) {
    // console.log(error)
    response.status(error.model ? 404 : 500).send(error)
  }
}
