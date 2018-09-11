let fs = require('fs-extra')
const { _PouchDB } = require('./src/_PouchDB.js')

const project = process.argv.length >= 3 && process.argv[2]
const remove = process.argv.length >= 4 && process.argv[3] === '-r'

// node initProject ASLVtest -r
// -r = delete all previous project data
// Make milesnlwork@gmail.com the project admin

if (!project) process.exit(1)

if (remove) { fs.removeSync(`./projects/${project}`) }

function init(dbName, members) {
    let db = new _PouchDB(dbName)

    return new Promise((resolve, reject) => {
        let doc2 = {
            items: members,
            _id: 'members',
        }

        db.put(doc2)
            .then(() => resolve())
            .catch(err => reject(err))
    })
}

init(project, [ { email: 'nmiles@biblesocieties.org', role: 'admin' } ])
.then(() => {
    console.error('DONE!')
})
.catch(err => {
    console.error(err)
})
