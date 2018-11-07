// Return a list of project names that this user has access to.
// Expects that authentication has already set req.email.

const fs = require('fs')
const _ = require('underscore')
const { _PouchDB, dbExists } = require('./_PouchDB.js')

const log = require('debug')('sltt:createProject')
const debug = require('debug')('slttdebug:createProject')

function reportFailure(res, err) {
    err = JSON.stringify(err)
    let message = `/_create_ ERROR: ${err}`
    log(message)

    res.status(500).send(message)
}

async function createProject(name) {
    if (dbExists(name)) {
        reportFailure(res, `Project ${name} already exists`)
        return
    }

    let db = new _PouchDB(name)

    let doc = {
        items: [],
        _id: 'members',
    }

    await db.put(doc)
}

exports.createProject = function (req, res, next) {
    log(`create ${req.project}`)

    if (req.method !== 'PUT') {
        reportFailure(res, 'Must use PUT')
        return
    }

    createProject(req.project)
        .then(() => {
            log('done')
            res.status(200).end()
        })
        .catch(err => reportFailure(res, err))
}
