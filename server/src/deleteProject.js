// Delete project.
// You must be root to do this

const fs = require('fs')
const _ = require('underscore')
const { _PouchDB, dbExists, dbDelete } = require('./_PouchDB.js')

const log = require('debug')('sltt:deleteProject')
const debug = require('debug')('slttdebug:deleteProject')

function reportFailure(res, err) {
    //err = JSON.stringify(err)
    let message = `/_delete_ ERROR: ${err}`
    log(message)

    res.status(500).send(message)
}

async function deleteProject(res, project) {
    if (!dbExists(project)) {
        reportFailure(res, `Project ${project} does not exist`)
        return
    }

    await dbDelete(project)
}

exports.deleteProject = function (req, res, next) {
    log(`delete ${req.project}`)

    if (req.method !== 'PUT') {
        reportFailure(res, 'Must use PUT')
        return
    }

    if (!req.isRoot) {
        reportFailure(res, 'Not root user')
        return
    }

    deleteProject(res, req.project)
        .then(() => {
            log('done')
            res.status(200).end()
        })
        .catch(err => reportFailure(res, err))
}
