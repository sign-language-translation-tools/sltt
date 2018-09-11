//const { sendError } = require('./log.js')
const { _PouchDB } = require('./_PouchDB.js')

//     _test1: { milesnlwork@gmail.com/admin, bob@gmail.com/translator }
//     _test2: { milesnlwork@gmail.com/translator, bob@gmail.com/admin }
//     _test3: { bob@gmail.com/admin }

function init(dbName, members) {
    let db = new _PouchDB(dbName)
    //console.log('!!!init', dbName)

    return new Promise((resolve, reject) => {
        let doc = {
            items: [],
            _id: 'portions',
        }
        let doc2 = {
            items: members,
            _id: 'members',
        }

        db.put(doc)
            .then(db.put(doc2))
            .then(resolve)
            .catch(err => reject(err))
    })
}

exports.initializeTestProjects = function (req, res, next) {
    init('_test1', [
        { email: 'milesnlwork@gmail.com', role: 'admin' },
        { email: 'bob@gmail.com', role: 'translator'},
    ])
    .then(init('_test2', [
            { email: 'milesnlwork@gmail.com', role: 'translator' },
            { email: 'bob@gmail.com', role: 'admin' },
    ]))
    .then(init('_test3', [
            { email: 'bob@gmail.com', role: 'admin' },
    ]))
    .then(() => {
        //console.log('initializeTestProjects DONE')
        res.status(200).end()
    })
    .catch(err => {
        let msg = `initializeTestProjects: ${err}`
        console.error(msg)
        res.status(500).send(msg)
    })
}

function removeAll(db) {
    return new Promise((resolve, reject) => {
        db.allDocs()
            .then(result => {
                let promises = result.rows.map(row => { 
                    //console.log(`remove ${row.id}`)
                    return db.remove(row.id, row.value.rev) 
                })
                return Promise.all(promises)
            })
            .then(() => { resolve() })
            .catch(err => { reject(err) })
    })
}

exports.destroyTestDbs = function(req, res, next) {
    let db1 = new _PouchDB('_test1')
    let db2 = new _PouchDB('_test2')
    let db3 = new _PouchDB('_test3')
    //console.log('start destroy testDbs')

    Promise.all([removeAll(db1), removeAll(db2), removeAll(db3)])
        .then(() => {
            //console.log("All testDbs removed")
            res.status(200).end()
        })
        .catch(err => {
            let msg = `destroyTestDbs: ${err}`
            console.error(msg)
            res.status(500).send(msg)
        })
}
    
const OLDdestroyTestDbs = function (req, res, next) {
    let db1 = new _PouchDB('_test1')
    let db2 = new _PouchDB('_test2')
    let db3 = new _PouchDB('_test3')

    db1.info()
        .then(details => {
            if (details.doc_count !== 0)
                db1.destroy()
                    .then(() => console.log('_test1 removed'))
            return db2.info()
        })
        .then(details => {
            if (details.doc_count !== 0)
                db2.destroy()
                    .then(() => console.log('_test2 removed'))
            return db3.info()
        })
        .then(details => {
            if (details.doc_count !== 0)
                db3.destroy()
                    .then(() => console.log('_test3 removed'))
        })
        .then(() => {
            console.log("All test projects removed")
            res.status(200).end()
        })
        .catch(err => {
            let msg = `destroyTestDbs: ${err}`
            console.error(msg)
            res.status(500).send(msg)
        })
}
