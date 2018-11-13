import PouchDb from 'pouchdb'
import fetch from 'node-fetch'
import upsert from 'pouchdb-upsert'

import { getHostUrl, checkStatus, authorization, getJson } from './API.js'
import { getGoogleIdToken } from '../components/auth/GoogleLogin'
import { user } from '../components/auth/User.js'


const log = require('debug')('sltt:Db') 

PouchDb.plugin(upsert)

//PouchDb.debug.enable('*')

export const createDb = function(name) {
    log(`createDb ${name}`)

    let dbUrl = `${getHostUrl()}/${name}`
    let db = new PouchDb(dbUrl, {})

    // See https://github.com/pouchdb/pouchdb/issues/5322
    // Before we can issue a request to the PouchDb server we need to make
    // sure that our jwt id_token has not expired.
    // We do this by intercepting the _ajax method for the local copy of the
    // db.

    const ajax = db._ajax
    db._ajax = function (opts, cb) {
        getGoogleIdToken()   // refresh id_token if it has expired
           .then(() => {
               // rebuild authorization header to have current id_token
               //log(`options IN`, opts)
               const myHeaders = { Authorization: authorization() }
               const headers = Object.assign({}, opts.headers, myHeaders)
               const options2 = Object.assign({}, opts, { headers })
               //log(`options OUT`, options2)
               ajax(options2, cb)
           })
           .catch(err => {
               log(`getGoogleIdToken FAILED`, err)
               cb(err)
           })
    };

    return db
}

export const destroyTestDbs = function (done) {
    let options = {
        method: 'GET',
        headers: { Authorization: authorization() },
    }

    let path = `${getHostUrl()}/destroyTestDbs`

    fetch(path, options)
        .then(checkStatus)
        .then(() => done())
        .catch(err => {
            let msg = `destroyTestDbs: ${err}`
            log(msg)
            done(msg)
        })
}

export const initializeTestProjects = function (done) {
    let options = {
        method: 'GET',
        headers: { Authorization: authorization() },
    }

    let path = `${getHostUrl()}/initializeTestProjects`
    fetch(path, options)
        .then(checkStatus)
        .then(() => done())
        .catch(err => {
            let msg = `initializeTestProjects: ${err}`
            log(msg)
            done(msg)
        })
}

export const getAuthorizedProjects = function (cb) {
    let options = {
        method: 'GET',
        headers: { Authorization: authorization() },
    }

    let path = `${getHostUrl()}/_projects`
    //log(`getAuthorizedProjects ${path}`)

    fetch(path, options)
        .then(checkStatus)
        .then(getJson)
        .then(result => {
            log(`getAuthorizedProjects result= ${JSON.stringify(result)}`)
            user.iAmRoot = result.iAmRoot
            cb(null, result.projectNames)
        })
        .catch(err => {
            let msg = `*** getAuthorizedProjects ${err}`
            log(msg)
            cb(msg)
        })
    
}


