import PouchDb from 'pouchdb'
import fetch from 'node-fetch'
import upsert from 'pouchdb-upsert'

import { hostUrl, checkStatus, authorization, getJson } from './API.js'

const debug = require('debug')('sltt:Db') 

PouchDb.plugin(upsert)

//PouchDb.debug.enable('*')


export const createDb = function(name) {
    debug(`createDb ${name}`)

    let options = {
        ajax: {
            headers: { Authorization: authorization() }
        },
    }

    let dbUrl = `${hostUrl}/${name}`
    return new PouchDb(dbUrl, options)
}

export const destroyTestDbs = function (done) {
    let options = {
        method: 'GET',
        headers: { Authorization: authorization() },
    }

    let path = `${hostUrl}/destroyTestDbs`
    fetch(path, options)
        .then(checkStatus)
        .then(() => done())
        .catch(err => {
            let msg = `destroyTestDbs: ${err}`
            debug(msg)
            done(msg)
        })
}

export const initializeTestProjects = function (done) {
    let options = {
        method: 'GET',
        headers: { Authorization: authorization() },
    }

    let path = `${hostUrl}/initializeTestProjects`
    fetch(path, options)
        .then(checkStatus)
        .then(() => done())
        .catch(err => {
            let msg = `initializeTestProjects: ${err}`
            debug(msg)
            done(msg)
        })
}

export const getAuthorizedProjects = function (cb) {
    let options = {
        method: 'GET',
        headers: { Authorization: authorization() },
    }

    let path = `${hostUrl}/_projects`
    debug(`getAuthorizedProjects ${path}`)

    fetch(path, options)
        .then(checkStatus)
        .then(getJson)
        .then(projects => {
            debug(`getAuthorizedProjects result= ${projects}`)
            cb(null, projects)
        })
        .catch(err => {
            let msg = `*** getAuthorizedProjects ${err}`
            debug(msg)
            cb(msg)
        })
    
}


