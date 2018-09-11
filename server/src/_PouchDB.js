let PouchDB = require('pouchdb')

let projectsDir = process.env.PROJECTSDIR || '../../projects/'

projectsDir = projectsDir + (projectsDir.endsWith('/') ? '' : '/')

exports._PouchDB = PouchDB.defaults({ prefix: projectsDir })
exports._PouchDBPath = projectsDir
