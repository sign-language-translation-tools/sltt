let PouchDB = require('pouchdb')

const debug = console.log

let projectsDir = process.env.SLTT_PROJECTS_DIR || '../../projects/'

projectsDir = projectsDir + (projectsDir.endsWith('/') ? '' : '/')
debug(`projectsDir: ${projectsDir}, cwd=${process.cwd()}`)

exports._PouchDB = PouchDB.defaults({ prefix: projectsDir })
exports._PouchDBPath = projectsDir
