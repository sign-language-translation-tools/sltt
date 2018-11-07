// update push/url support to match new url format
// unit tests
//   provide a way to initialize 'members' entries for test projects

// adapt to new url order (server, client, test cases)
// create docker image?

// add support for SSL
// deploy to server

// support root
// centralized logging
// make pouchdb-fauxton available


const { _PouchDB } = require('./src/_PouchDB.js')
let express = require('express')
let cors = require('cors')
const _debug = require('debug')
_debug.log = console.log.bind(console)
_debug.enable('sltt:.*')
const log = _debug('sltt:index')

let { logRequest } = require('./src/logRequest.js')
let { pushBlob } = require('./src/pushBlob.js')
let { concatBlobs } = require('./src/concatBlobs.js')
let { getUrl } = require('./src/getUrl.js')
let { checkAuthentication } = require('./src/authentication.js')
let { checkAuthorization } = require('./src/authorization.js')
let { getMembers } = require('./src/getMembers.js')
let { initializeTestProjects, destroyTestDbs } = require('./src/initializeTestProjects.js')
let { projects } = require('./src/projects.js')
let { createProject } = require('./src/createProject.js')
let { deleteProject } = require('./src/deleteProject.js')

let app = express()

let _expressPouchdb = require('express-pouchdb') 
let expressPouchdb = _expressPouchdb(_PouchDB) // see express-pouchdb/lib/index.js(77)

function intercept(req, resp, next) {
    //log("intercept", req.url)
    expressPouchdb(req, resp, next)
}

app.use(cors({ 
    credentials: true, 
    origin: ['http://localhost:3000', 'https://sl.paratext.org'], 
}))

// We put the logRequest after CORS so that we do not see the (normally trivial)
// CORS interactions. Note that this means if the CORS processing fails it will make
// it look like the server is getting no request at all. If you suspect CORS
// problems move this before the CORS line.
app.use(logRequest)

//app.use((req, resp, next) => {
//    resp.status(500).send('FAIL')
//})

app.use(checkAuthentication)   // validate bearer token and set req.email
app.use('/initializeTestProjects', initializeTestProjects)
app.use('/destroyTestDbs', destroyTestDbs)
app.use('/_projects', projects)

app.use(getMembers)   // set req.members = [{email: , role: }, ...]
app.use(checkAuthorization)   //

//app.use(express.static('node_modules/pouchdb-fauxton/www'))

//!! why doesn't a more specific RE path work in the following?
app.use(/.*_create_/, createProject)
app.use(/.*_delete_/, deleteProject)

app.use(/.*_push_/, pushBlob)
app.use(/.*_concat_/, concatBlobs)
app.use(/.*_url_/, getUrl)

app.use('/', intercept)

log('listen on 3001')
app.listen(3001)
