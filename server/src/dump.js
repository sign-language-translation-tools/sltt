const { _PouchDB, _PouchDBPath } = require('./_PouchDB.js')

let db = new _PouchDB('LSPeru')
db.get('members')
    .then(doc => {
        console.log('doc', doc)
    })
    .catch(err => { 
    console.log(err)
    })
