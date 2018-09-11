// Return a list of project names that this user has access to.
// Expects that authentication has already set req.email.

const fs = require('fs')
const _ = require('underscore')
const { log, sendError } = require('./log.js')
const { _PouchDB, _PouchDBPath } = require('./_PouchDB.js')

// Every project has a db doc with _id = 'members'.
// The doc has a property: 'items': [ {email: , role: } ]

function _isMember(dbName, email) {
    return new Promise((resolve, reject) => {
        let db = new _PouchDB(dbName)
        db.get('members')
          .then(doc => {
              if (_.findWhere(doc.items, {email})) {
                  //log.debug(`${email} IS member of ${dbName} `)
                  resolve(dbName)
                  return
              }

              //log.debug(`${email} IS NOT member of ${dbName} `)
              resolve(null)
          })
          .catch(err => { 
              if (err.status !== 404) {  // don't log if not 'members' item present, not really a project db
                  log.error(`/_project, get members failed, dbName=${dbName}, err=${err}`)              
              }
              resolve(null) // Don't fail entire operation because one project could not be openend
          })
    })
}

function reportFailure(err) {
    log.error(`/_projects failed, err=${err}`)
    res.writeHead(500)
    res.end()
}

exports.projects = function (req, res, next) {
    fs.readdir(_PouchDBPath, function (err, subdirs) {
        if (err) { reportFailure(err); return }

        let promises = subdirs.map(subdir => _isMember(subdir, req.email))
        Promise.all(promises)
            .then(results => {
                results = _.filter(results, result => result !== null)
                log.debug(`/_projects ${req.email} = ${results}`)
                res.send(results)
            })
            .catch(reportFailure)
    })
}
