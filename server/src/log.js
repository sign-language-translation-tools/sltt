const log = {}
log.info = console.log
log.error = console.error

log.debug = function() {
    if (!process.env.SLTTDEBUG) return
    
    console.log.apply(null, arguments)
}

exports.log = log

exports.sendError = function(res, statusCode, message) {
    console.log('*** sendError', `[${statusCode}] ${message}`)
    res.status(404).send(message)
}
