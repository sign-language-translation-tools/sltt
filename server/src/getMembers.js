// Expects a url of the form /projectName/...
// Finds the members of the project and assigns them to 
// req.members = [{email: , role: }, ...]

//! WBN to cache these so that we did not have to do a DB read each time
//  would have to invalidate cache entry in on PUT/members

const fs = require('fs')
const _ = require('underscore')
const { sendError } = require('./log.js')
const { _PouchDB } = require('./_PouchDB.js')

exports.getMembers = function (req, res, next) {
    let { url } = req

    let [baseUrl, qs] = url.split('?')
    let parts = baseUrl.split('/')
    let [ unused, project ] = parts

    if (!project) {
        sendError(res, 401, `No project present!`)
        return
    }

    let db = new _PouchDB(project)
    db.get('members', (err, doc) => {
        if (err) {
            sendError(res, 404, `[${project}] Cannot get members (${err})!`)
            return
        }

        req.members = doc.items
        next()
    })

}
