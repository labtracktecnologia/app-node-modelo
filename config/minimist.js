const buildOptions = require('minimist-options')
const minimist = require('minimist')

const options = buildOptions({
    port: {
        type: 'number',
        alias: 'p',
        default: 3000
    },
    db: {
        type: 'string',
        default: 'mongodb://localhost/sistema'
    }
})

module.exports = minimist(process.argv.slice(2), options)
