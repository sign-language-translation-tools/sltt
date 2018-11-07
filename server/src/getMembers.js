// Expects a url of the form /projectName/...
// Finds the members of the project and assigns them to 
// req.members = [{email: , role: }, ...]

//! WBN to cache these so that we did not have to do a DB read each time
//  would have to invalidate cache entry in on PUT/members

const fs = require('fs')
const _ = require('underscore')
const { sendError } = require('./log.js')
const { _PouchDB, dbExists } = require('./_PouchDB.js')
const { ROOT_ROLE } = require('./roles.js')

const log = require('debug')('sltt:getMembers')
const debug = require('debug')('slttdebug:getMembers')

// At the moment the server code has no need of having the root user
// artificiall added to the list of project members

// If this is a root user and they are not already on this project
// add them to list of authorized users
// function addRootUser(req) {
//     let { isRoot, members, email } = req
//     if (!isRoot) return

//     // If root user already present, remove and readd as root role
//     req.members = members.filter(member => member.email !== email)
//     let root = { email, role: ROOT_ROLE }
//     debug(`addRootUser ${root}`)
//     req.members.push(root)
// }

exports.getMembers = function (req, res, next) {
    let { url } = req

    let [baseUrl, qs] = url.split('?')
    let parts = baseUrl.split('/')
    let [ unused, project ] = parts

    if (!project) {
        let error = `No project present!`
        log(error)
        sendError(res, 401, error)
        return
    }

    // If project does not exist yet, return empty members list.
    // This is useful when request is _create_
    if (!dbExists(project)) {
        req.members = []
        next()
        return
    }

    let db
    try {
        db = new _PouchDB(project)
    } catch (err) {
        let error = `[${project}] Cannot create db (${err})!`
        log(error)
        sendError(res, 404, error)
        return
    } 

    db.get('members', (err, doc) => {
        if (err) {
            let error = `[${project}] Cannot get members (${err})!`
            log(error)
            sendError(res, 404, error)
            return
        }

        req.members = doc.items
        
        // addRootUser(req)

        next()
    })

}
