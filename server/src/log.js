const log = {}
log.info = console.log
log.debug = console.log
log.error = console.error

exports.log = log

exports.sendError = function(res, statusCode, message) {
    console.log('*** sendError', `[${statusCode}] ${message}`)
    res.status(404).send(message)
}
