// Singleton userProjects object. 
// When initializingStarted contains all the projects for current user.

import { extendObservable, autorun } from 'mobx'
//import _ from 'underscore'

import { Project } from '../../models/Project.js'
import { getAuthorizedProjects } from '../../models/Db.js'
import { user } from '../auth/User.js'
import { displayError } from '../utils/Errors.jsx'

// add debug code
// add exception handler

const log = require('debug')('sltt:UserProjects') 

class UserProjects {
    constructor () {
        extendObservable(this, {
            projects: [],
            initializingStarted: false,
            initialized: false,
            id_token: '',
        })

        autorun(() => {
            this.initializeProjects()  // run this whenever id_token changes
        })
    }

    // Initialize projects for this user.
    // Automatically rerun by autorun whenever id_token changes.
    async initializeProjects() {
        let { id_token, username } = user
        log(`initializeProjects username=${username} id_token=${id_token && id_token.slice(0,60)}`)

        if (!id_token || !username) {
            this.clear()   // If we no longer have a token or username, clear the projects
            return
        }

        if (this.initializingStarted) return

        this.initializingStarted = true

        let names = await this.getProjectNames(username)

        try {
            for (let name of names) {
                await this.createProject(name)
            }
        } catch (error) {
            log(`ERROR getAuthorizedProjects`, error)
            displayError(error)
        }

        this.initialized = true
    }

    getProjectNames(username) {
        return new Promise((resolve, reject) => {
            log(`getAuthorizedProjects ${username}`)

            getAuthorizedProjects((err, projectNames) => {
                if (err) {
                    reject(err)
                    return
                }

                projectNames = projectNames.filter(pn => !pn.startsWith('_test'))

                log(`getProjectNames projects=${projectNames}`)
                resolve(projectNames)
            })
        })
    }

    createProject(name) {
        return new Promise((resolve, reject) => {
            let { projects } = this
            let { username } = user

            log(`[${name}] createProject (${username})`)

            let project = Project.create({ name, username })
            project.initialize(err => {
                if (err) {
                    let message = `ERROR [${name}] _createProject ${err.stack}`
                    log(message)
                    displayError(message)
                    resolve()  // don't stop everything just because one project fails to initialize
                    return
                }

                log(`[${project.name}] initialize done`)

                projects.push(project)
                resolve()
            })
        })
    }

    clear() {
        log('clear', this.projects.length)
        this.projects.forEach(p => p.cancel())  
        
        if (this.projects.length) 
            this.projects = []
            
        this.initializingStarted = false
        this.initialized = false
    }
}

export const userProjects = new UserProjects()
