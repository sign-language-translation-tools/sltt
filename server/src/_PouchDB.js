let PouchDB = require('pouchdb')

const debug = console.log

let projectsDir = process.env.PROJECTSDIR || '../../projects/'

projectsDir = projectsDir + (projectsDir.endsWith('/') ? '' : '/')
debug(`projectsDir: ${process.cwd()}/${projectsDir}`)

exports._PouchDB = PouchDB.defaults({ prefix: projectsDir })
exports._PouchDBPath = projectsDir
