import PouchDb from 'pouchdb'
import fetch from 'node-fetch'
import upsert from 'pouchdb-upsert'

import { getHostUrl, checkStatus, authorization, getJson } from './API.js'

const log = require('debug')('sltt:Db') 

PouchDb.plugin(upsert)

//PouchDb.debug.enable('*')


export const createDb = function(name) {
    log(`createDb ${name}`)

    let options = {
        ajax: {
            headers: { Authorization: authorization() }
        },
    }

    let dbUrl = `${getHostUrl()}/${name}`
    return new PouchDb(dbUrl, options)
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
    log(`getAuthorizedProjects ${path}`)

    fetch(path, options)
        .then(checkStatus)
        .then(getJson)
        .then(projects => {
            log(`getAuthorizedProjects result= ${projects}`)
            cb(null, projects)
        })
        .catch(err => {
            let msg = `*** getAuthorizedProjects ${err}`
            log(msg)
            cb(msg)
        })
    
}


