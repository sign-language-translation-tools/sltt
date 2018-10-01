// Singleton userProjects object. 
// When initialized contains all the projects for current user.

import { extendObservable } from 'mobx'
import _ from 'underscore'

import { Project } from '../../models/Project.js'
import { getAuthorizedProjects } from '../../models/Db.js'

const log = require('debug')('sltt:UserProject') 

class Projects {
    constructor () {
        extendObservable(this, {
            projects: [],
            initialized: false,
        })
    }

    _createProject(name, username) {
        return new Promise((resolve, reject) => {
            log(`[${name}] _createProject`)

            let project = Project.create({
                name,
                username,
            })

            project.initialize(err => {
                if (err) {
                    log(`ERROR [${name}] _createProject ${err.stack}`)
                    resolve(null)
                    return
                }

                log(`[${project.name}] initialize done`)

                resolve(project)
            })
        })
    }

    _createAllMyProjects = function (username, cb) {
        log('createAllMyProjects')

        getAuthorizedProjects((err, projectNames) => {
            if (err) {
                log(`ERROR getAuthorizedProjects ${err}`)
                cb(err)
                return
            }

            projectNames = projectNames.filter(pn => !pn.startsWith('_test'))

            log(`[${username}] authorizedProjects: ${projectNames}`)
            projectNames = projectNames || []
            let promises = projectNames.map(projectName => this._createProject(projectName, username))

            Promise.all(promises)
                .then(projects => {
                    projects = _.filter(projects, project => project !== null)
                    cb(null, projects)
                })
                .catch(err => cb(err))
        })
    }

    initialize(username, cb) {
        log(`initialize ${username}`)

        this.projects = []
        this.initialized = false

        this._createAllMyProjects(username, (err, _projects) => {
            if (err) {
                cb && cb(err)
                return
            }

            this.initialized = true
            this.projects = _projects
            cb && cb()
        })
     }

    clear() {
        log('clear')
        this.projects.forEach(p => p.cancel())  
        
        if (this.projects.length) 
            this.projects = []
            
        this.initialized = false
    }
}

export const userProjects = new Projects()
