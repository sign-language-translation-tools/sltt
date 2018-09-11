let PouchDB = require('pouchdb')

exports._PouchDB = PouchDB.defaults({ prefix: './projects/' })

exports._PouchDBPath = './projects/'
