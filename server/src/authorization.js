// Looks at req.email and req.members.
// Send error if user is not authorized to perform requested operation on this project.

//!! no support for rejecting invalid operations by observers yet

const fs =require('fs')
const _ = require('underscore')
const { sendError } = require('./log.js')

exports.checkAuthorization = function (req, res, next) {
    let { email, members, url, method } = req

    //console.log('!!!method:::url', method + ":::" + url)
    
    let [baseUrl, qs] = url.split('?')
    let parts = baseUrl.split('/')
    let [ unused, project, _id ] = parts

    let member = _.findWhere(members, { email })
    if (!member) {
        sendError(res, 404, `[${project}/${email}] Not a member!`)
        return
    }

    if (_id === 'members' && method.toLowerCase() === 'put' && member.role !== 'admin') {
        sendError(res, 404, `[${project}/${email}] Not admin!`)
        return
    }

    next()
}
