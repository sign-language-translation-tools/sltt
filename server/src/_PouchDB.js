const PouchDB = require('pouchdb')
const del = require('del')
const fs = require('fs')
const mv = require('mv')


const debug = console.log

let projectsDir = process.env.SLTT_PROJECTS_DIR || '../../projects/'

projectsDir = projectsDir + (projectsDir.endsWith('/') ? '' : '/')
debug(`projectsDir: ${projectsDir}, cwd=${process.cwd()}`)

exports._PouchDB = PouchDB.defaults({ prefix: projectsDir })
exports._PouchDBPath = projectsDir

exports.dbExists = function(name) {
    return fs.existsSync(projectsDir + name)
}

// Make a project appear to be deleted by moving the PouchDb to
// <SLTT_PROJECTS_DIR>/../sltt_deleted_projects/<projectName>.<timeStamp>

exports.dbDelete = function (name) {
    return new Promise((resolve, reject) => {
        if (!name || name.length === 0) {
            reject('Must name project to delete')
            return
        }
        
        let projectDir = projectsDir + name
        let backupDir = `${projectsDir}../sltt_deleted_projects/${name + '.' + (new Date()).toISOString().slice(0, -5)}`

        debug(`dbDelete ${projectDir} => ${backupDir}`)

        mv(projectDir, backupDir, { mkdirp: true }, err => {
            if (err) {
                debug(`dbDelete ERROR`, err)
                reject(err)
            }
            else resolve()
        })
    })
}
