// Return a list of project names that this user has access to.
// Expects that authentication has already set req.email.

const fs = require('fs')
const _ = require('underscore')
const { _PouchDB, _PouchDBPath } = require('./_PouchDB.js')

const log = require('debug')('sltt:projects')
const debug = require('debug')('slttdebug:projects')


// Every project has a db doc with _id = 'members'.
// The doc has a property: 'items': [ {email: , role: } ]

function _isMember(dbName, email, isRoot) {
    return new Promise((resolve, reject) => {
        // Ignore config files
        if (dbName.startsWith('.')) {
            resolve(null)
            return
        }

        let db = new _PouchDB(dbName)
        db.get('members')
          .then(doc => {
              if (_.findWhere(doc.items, {email})) {
                  log(`${email} IS member of ${dbName} `)
                  resolve(dbName)
                  return
              }

              if (isRoot) {
                  log(`${email} IS ROOT in ${dbName} `)
                  resolve(dbName)
                  return
              }

              //debug(`${email} IS NOT member of ${dbName} `)
              resolve(null)
          })
          .catch(err => { 
              if (err.status !== 404) {  // don't log if not 'members' item present, not really a project db
                  log(`/_project, get members ERROR, dbName=${dbName}, err=${err}`)              
              }
              resolve(null) // Don't fail entire operation because one project could not be openend
          })
    })
}

function reportFailure(res, err) {
    log(`/_projects failed, err=${err}`)
    res.writeHead(500)
    res.end()
}

exports.projects = function (req, res, next) {
    fs.readdir(_PouchDBPath, function (err, subdirs) {
        if (err) { reportFailure(res, err); return }

        let promises = subdirs.map(subdir => _isMember(subdir, req.email, req.isRoot))
        Promise.all(promises)
            .then(projectNames => {
                projectNames = _.filter(projectNames, projectName => projectName !== null)
                log(`/_projects ${req.email} = ${projectNames}`)
                res.send({ projectNames, iAmRoot: req.isRoot})
            })
            .catch(err => reportFailure(res, err))
    })
}
