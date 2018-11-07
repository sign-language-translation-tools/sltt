// Looks at req.email and req.members.
// Send error if user is not authorized to perform requested operation on this project.

//!! no support for rejecting invalid operations by observers yet

const fs =require('fs')
const _ = require('underscore')
const { sendError } = require('./log.js')
const { ADMIN_ROLE } = require('./roles.js')

exports.checkAuthorization = function (req, res, next) {
    // email and isRoot are from authentication.js
    // memebers is from getMembers.js
    let { email, members, isRoot, url, method } = req

    //console.log('!!!method:::url', method + ":::" + url)
    
    let [baseUrl, qs] = url.split('?')
    let parts = baseUrl.split('/')
    let [ unused, project, _id ] = parts

    req.project = project

    // Give test user root privileges on _test4 and _test5
    req.isRoot = isRoot || (req.isUnittest && ['_test4', '_test5'].includes(project))

    if (req.isRoot) {
        next()
        return
    }


    let member = _.findWhere(members, { email })
    if (!member) {
        sendError(res, 404, `[${project}/${email}] Not a member!`)
        return
    }

    if (_id === 'members' && method.toLowerCase() === 'put') {
        if (member.role !== ADMIN_ROLE) {
            sendError(res, 404, `[${project}/${email}] Not admin/root!`)
            return
        }
    }

    next()
}
